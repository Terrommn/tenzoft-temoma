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
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the user ID from the request body
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log('Deleting user:', userId)

    // Delete user data from all tables
    const { error: expensesError } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('user_id', userId)

    if (expensesError) {
      console.error('Error deleting expenses:', expensesError)
    }

    const { error: budgetsError } = await supabaseAdmin
      .from('budgets')
      .delete()
      .eq('user_id', userId)

    if (budgetsError) {
      console.error('Error deleting budgets:', budgetsError)
    }

    const { error: categoriesError } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('user_id', userId)

    if (categoriesError) {
      console.error('Error deleting categories:', categoriesError)
    }

    // Delete the user from Supabase Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting user from auth:', deleteUserError)
      throw deleteUserError
    }

    console.log('User deleted successfully:', userId)

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in delete-user function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred while deleting the user' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
