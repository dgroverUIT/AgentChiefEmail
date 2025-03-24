import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Define handlers
export const handlers = [
  http.post('https://ijoajnhusxfzyytyxgnl.supabase.co/functions/v1/create-bot', () => {
    return HttpResponse.json({
      success: true,
      bot: {
        id: '123',
        name: 'Test Bot',
        status: 'active',
        email_address: 'test@example.com',
        openai_assistant_id: 'asst_123',
        openai_status: 'active',
      },
    });
  }),

  http.patch('https://ijoajnhusxfzyytyxgnl.supabase.co/rest/v1/bots', () => {
    return HttpResponse.json({
      id: '123',
      name: 'Updated Bot',
    });
  }),

  http.delete('https://ijoajnhusxfzyytyxgnl.supabase.co/rest/v1/bots', () => {
    return HttpResponse.json({});
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close server after all tests
afterAll(() => server.close());