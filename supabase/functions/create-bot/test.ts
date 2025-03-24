import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.28.0';

// Mock OpenAI API
const mockOpenAI = {
  createAssistant: () => ({
    id: 'asst_test123',
    model: 'gpt-4-turbo-preview',
  }),
};

// Mock Supabase client
const mockSupabase = {
  from: () => ({
    insert: () => ({
      select: () => ({
        single: () => ({
          data: {
            id: 'test123',
            name: 'Test Bot',
            email_address: 'test@example.com',
            openai_assistant_id: 'asst_test123',
          },
          error: null,
        }),
      }),
    }),
  }),
};

Deno.test('create-bot edge function', async () => {
  const testRequest = new Request('http://localhost:8000/create-bot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Test Bot',
      description: 'Test description',
      emailAddress: 'test@example.com',
      organizationId: '123',
      createdBy: '456',
    }),
  });

  // Mock environment variables
  Deno.env.set('SUPABASE_URL', 'http://localhost:54321');
  Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
  Deno.env.set('OPENAI_API_KEY', 'test-openai-key');

  // Import and execute the edge function
  const mod = await import('./index.ts');
  const response = await mod.default(testRequest);
  const result = await response.json();

  // Assertions
  assertEquals(response.status, 200);
  assertEquals(result.success, true);
  assertEquals(result.bot.name, 'Test Bot');
  assertEquals(result.bot.openai_assistant_id, 'asst_test123');
});