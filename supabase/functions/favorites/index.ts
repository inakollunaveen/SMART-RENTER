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
    const listingId = pathParts[pathParts.length - 1]

    // Get authenticated user
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

    switch (method) {
      case 'GET':
        return await getUserFavorites(user.id, supabase)
      case 'POST':
        return await addToFavorites(user.id, listingId, supabase)
      case 'DELETE':
        return await removeFromFavorites(user.id, listingId, supabase)
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

async function getUserFavorites(userId: string, supabase: any) {
  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      *,
      listings (
        *,
        users:owner_id (
          name,
          email,
          phone
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ favorites }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function addToFavorites(userId: string, listingId: string, supabase: any) {
  // Check if listing exists and is verified
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('status', 'verified')
    .single()

  if (listingError || !listing) {
    return new Response(
      JSON.stringify({ error: 'Listing not found or not verified' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Add to favorites (will fail if already exists due to unique constraint)
  const { data: favorite, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      listing_id: listingId
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return new Response(
        JSON.stringify({ error: 'Already in favorites' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ 
      message: 'Added to favorites',
      favorite 
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function removeFromFavorites(userId: string, listingId: string, supabase: any) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('listing_id', listingId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ message: 'Removed from favorites' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}