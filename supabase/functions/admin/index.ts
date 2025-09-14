import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { method } = req
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)

    // Get authenticated user and verify admin role
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

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route handling
    if (pathParts.includes('listings')) {
      if (pathParts.includes('pending')) {
        return await getPendingListings(supabase)
      } else if (method === 'PUT') {
        const listingId = pathParts[pathParts.length - 1]
        const action = pathParts[pathParts.length - 2] // 'verify' or 'block'
        return await updateListingStatus(listingId, action, supabase)
      }
    } else if (pathParts.includes('analytics')) {
      return await getAnalytics(supabase)
    }

    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getPendingListings(supabase: any) {
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:owner_id (
        name,
        email,
        phone
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ listings }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateListingStatus(listingId: string, action: string, supabase: any) {
  let status
  switch (action) {
    case 'verify':
      status = 'verified'
      break
    case 'block':
      status = 'blocked'
      break
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use verify or block' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', listingId)
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ 
      message: `Listing ${action}d successfully`,
      listing 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getAnalytics(supabase: any) {
  try {
    // Total counts
    const [
      { count: totalListings },
      { count: totalUsers },
      { count: totalOwners },
      { count: pendingListings }
    ] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'owner'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending')
    ])

    // Popular cities
    const { data: popularCities } = await supabase
      .from('listings')
      .select('city')
      .eq('status', 'verified')

    const cityStats = popularCities?.reduce((acc: any, listing: any) => {
      acc[listing.city] = (acc[listing.city] || 0) + 1
      return acc
    }, {}) || {}

    const topCities = Object.entries(cityStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }))

    // Average rent calculation
    const { data: rentData } = await supabase
      .from('listings')
      .select('rent')
      .eq('status', 'verified')

    const averageRent = rentData?.length > 0 
      ? Math.round(rentData.reduce((sum, listing) => sum + listing.rent, 0) / rentData.length)
      : 0

    // Property type distribution
    const { data: propertyTypes } = await supabase
      .from('listings')
      .select('property_type')
      .eq('status', 'verified')

    const propertyTypeStats = propertyTypes?.reduce((acc: any, listing: any) => {
      acc[listing.property_type] = (acc[listing.property_type] || 0) + 1
      return acc
    }, {}) || {}

    return new Response(
      JSON.stringify({
        totals: {
          listings: totalListings || 0,
          users: totalUsers || 0,
          owners: totalOwners || 0,
          pendingListings: pendingListings || 0
        },
        popularCities: topCities,
        averageRent,
        propertyTypeDistribution: propertyTypeStats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch analytics' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}