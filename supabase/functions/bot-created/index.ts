import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.28.0';

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
    // Verify authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    // Initialize clients with service role key for full access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_SECRET_KEY'),
    }));

    // Get bot data from request
    const { bot_id, name, description } = await req.json();

    // Create OpenAI Assistant
    const assistant = await openai.createAssistant({
      name,
      description,
      instructions: "You are an AI email assistant. Respond professionally and helpfully to customer inquiries.",
      model: "gpt-4-turbo-preview",
      tools: [{ type: "retrieval" }],
    });

    // Generate API key and encrypt using vault
    const { data: encryptedKey, error: vaultError } = await supabaseAdmin.rpc(
      'vault_encrypt',
      {
        secret: `agc-${crypto.randomUUID()}`,
        key_id: 'default'
      }
    );

    if (vaultError) throw vaultError;

    // Update bot with OpenAI and API details
    const { error } = await supabaseAdmin
      .from('bots')
      .update({
        openai_assistant_id: assistant.id,
        openai_model: assistant.model,
        openai_status: 'active',
        openai_api_key: encryptedKey,
      })
      .eq('id', bot_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in bot-created function:', error);
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