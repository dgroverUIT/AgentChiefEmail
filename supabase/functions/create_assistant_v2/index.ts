import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const body = await req.json();
    
    // Log the received parameters
    console.log('Received parameters:', {
      bot_name: body.bot_name,
      bot_email: body.bot_email,
      bot_description: body.bot_description
    });
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Parameters logged successfully',
        received: {
          bot_name: body.bot_name,
          bot_email: body.bot_email,
          bot_description: body.bot_description
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});