import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { method } = req
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const listingId = pathParts[pathParts.length - 1]

    switch (method) {
      case 'GET':
        if (listingId && listingId !== 'listings') {
          return await getListingById(listingId, supabase)
        } else {
          return await getListings(req, supabase)
        }
      case 'POST':
        return await createListing(req, supabase)
      case 'PUT':
        return await updateListing(req, supabase, listingId)
      case 'DELETE':
        return await deleteListing(req, supabase, listingId)
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getListings(req: Request, supabase: any) {
  const url = new URL(req.url)
  const searchParams = url.searchParams

  // Extract query parameters
  const location = searchParams.get('location')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const propertyType = searchParams.get('propertyType')
  const occupancy = searchParams.get('occupancy')
  const furnished = searchParams.get('furnished')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const offset = (page - 1) * limit

  let query = supabase
    .from('listings')
    .select(`
      *,
      users:owner_id (
        name,
        email,
        phone
      )
    `)
    .eq('status', 'verified')

  // Apply filters
  if (location) {
    query = query.or(`city.ilike.%${location}%,address.ilike.%${location}%`)
  }
  if (minPrice) {
    query = query.gte('rent', parseInt(minPrice))
  }
  if (maxPrice) {
    query = query.lte('rent', parseInt(maxPrice))
  }
  if (propertyType) {
    query = query.eq('property_type', propertyType)
  }
  if (occupancy) {
    query = query.eq('occupancy_preference', occupancy)
  }
  if (furnished === 'true') {
    query = query.eq('furnished', true)
  }

  // Apply pagination and ordering
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data: listings, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      listings,
      pagination: {
        page,
        limit,
        hasMore: listings.length === limit
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getListingById(listingId: string, supabase: any) {
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:owner_id (
        name,
        email,
        phone
      ),
      reviews (
        *,
        users:user_id (
          name
        )
      )
    `)
    .eq('id', listingId)
    .eq('status', 'verified')
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Listing not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ listing }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createListing(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if user is owner or admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userProfile || !['owner', 'admin'].includes(userProfile.role)) {
    return new Response(
      JSON.stringify({ error: 'Only owners can create listings' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const listingData = await req.json()
  
  // Geocode the address
  let latitude = null
  let longitude = null
  
  if (listingData.address && googleMapsApiKey) {
    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(listingData.address)}&key=${googleMapsApiKey}`
      )
      const geocodeData = await geocodeResponse.json()
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location
        latitude = location.lat
        longitude = location.lng
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      ...listingData,
      owner_id: user.id,
      latitude,
      longitude,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ listing }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateListing(req: Request, supabase: any, listingId: string) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const listingData = await req.json()

  // Geocode if address changed
  if (listingData.address && googleMapsApiKey) {
    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(listingData.address)}&key=${googleMapsApiKey}`
      )
      const geocodeData = await geocodeResponse.json()
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location
        listingData.latitude = location.lat
        listingData.longitude = location.lng
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .update(listingData)
    .eq('id', listingId)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ listing }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteListing(req: Request, supabase: any, listingId: string) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Authorization required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('owner_id', user.id)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Listing deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}