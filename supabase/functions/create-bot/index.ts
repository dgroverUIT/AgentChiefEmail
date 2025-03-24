import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BotCreationRequest {
  name: string;
  description: string;
  emailAddress: string;
  organizationId: string;
  createdBy: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }));

    const { name, description, emailAddress, organizationId, createdBy } = await req.json() as BotCreationRequest;

    // Create OpenAI Assistant
    const assistant = await openai.createAssistant({
      name,
      description,
      instructions: "You are an AI email assistant. Respond professionally and helpfully to customer inquiries.",
      model: "gpt-4-turbo-preview",
      tools: [{ type: "retrieval" }],
    });

    // Generate a unique API key for the bot
    const apiKey = `agc-${crypto.randomUUID()}`;

    // Create bot record in database
    const { data: bot, error } = await supabaseClient
      .from('bots')
      .insert({
        name,
        description,
        email_address: emailAddress,
        organization_id: organizationId,
        created_by: createdBy,
        openai_assistant_id: assistant.id,
        openai_model: assistant.model,
        openai_status: 'active',
        openai_api_key: apiKey,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        bot,
        assistantId: assistant.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});