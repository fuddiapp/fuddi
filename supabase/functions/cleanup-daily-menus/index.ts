import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    
    console.log(`🧹 Starting daily menu cleanup for date: ${today}`)

    // Get expired menus (menus with date < today)
    const { data: expiredMenus, error: fetchError } = await supabase
      .from('menus_dia')
      .select('id, menu_date, nombre_menu, business_id, dia')
      .neq('menu_date', today)

    if (fetchError) {
      console.error('❌ Error fetching expired menus:', fetchError)
      throw fetchError
    }

    let deletedMenusCount = 0
    let deletedReservationsCount = 0

    if (expiredMenus && expiredMenus.length > 0) {
      console.log(`📊 Found ${expiredMenus.length} expired menus to delete`)
      
      // Log expired menus for debugging
      expiredMenus.forEach(menu => {
        console.log(`   - ID: ${menu.id}, Date: ${menu.menu_date}, Day: ${menu.dia}, Name: ${menu.nombre_menu || 'Sin nombre'}`)
      })

      // Delete expired menus
      const { error: deleteMenusError } = await supabase
        .from('menus_dia')
        .delete()
        .neq('menu_date', today)

      if (deleteMenusError) {
        console.error('❌ Error deleting expired menus:', deleteMenusError)
        throw deleteMenusError
      }

      deletedMenusCount = expiredMenus.length
      console.log(`✅ Successfully deleted ${deletedMenusCount} expired menus`)
    } else {
      console.log('✅ No expired menus found')
    }

    // Also clean up expired reservations
    const { data: expiredReservations, error: fetchReservationsError } = await supabase
      .from('menu_reservations')
      .select('id, reservation_date, menu_name, client_name')
      .neq('reservation_date', today)

    if (fetchReservationsError) {
      console.error('❌ Error fetching expired reservations:', fetchReservationsError)
      // Don't throw here, continue with menu cleanup
    } else if (expiredReservations && expiredReservations.length > 0) {
      console.log(`📊 Found ${expiredReservations.length} expired reservations to delete`)

      // Delete expired reservations
      const { error: deleteReservationsError } = await supabase
        .from('menu_reservations')
        .delete()
        .neq('reservation_date', today)

      if (deleteReservationsError) {
        console.error('❌ Error deleting expired reservations:', deleteReservationsError)
        // Don't throw here, menu cleanup was successful
      } else {
        deletedReservationsCount = expiredReservations.length
        console.log(`✅ Successfully deleted ${deletedReservationsCount} expired reservations`)
      }
    } else {
      console.log('✅ No expired reservations found')
    }

    // Get current statistics
    const { count: currentMenus } = await supabase
      .from('menus_dia')
      .select('*', { count: 'exact', head: true })
      .eq('menu_date', today)

    const { count: totalMenus } = await supabase
      .from('menus_dia')
      .select('*', { count: 'exact', head: true })

    const { count: remainingExpiredMenus } = await supabase
      .from('menus_dia')
      .select('*', { count: 'exact', head: true })
      .neq('menu_date', today)

    const result = {
      success: true,
      message: 'Daily menu cleanup completed successfully',
      date: today,
      deletedMenus: deletedMenusCount,
      deletedReservations: deletedReservationsCount,
      statistics: {
        currentMenus: currentMenus || 0,
        totalMenus: totalMenus || 0,
        remainingExpiredMenus: remainingExpiredMenus || 0
      },
      timestamp: new Date().toISOString()
    }

    console.log('🎉 Cleanup completed successfully:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    
    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
}) 