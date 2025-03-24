import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/setup';
import { createBot, updateBot, deleteBot } from '../botService';
import { MOCK_BOTS } from '../../data/mockData';

describe('botService', () => {
  beforeEach(() => {
    // Reset any runtime handlers
    server.resetHandlers();
  });

  describe('createBot', () => {
    it('should successfully create a bot', async () => {
      const mockBot = {
        name: 'Test Bot',
        emailAddress: 'test@example.com',
        description: 'Test description',
      };

      const result = await createBot(mockBot);

      expect(result.success).toBe(true);
      expect(result.bot).toBeDefined();
      expect(result.bot.name).toBe(mockBot.name);
    });

    it('should handle errors during bot creation', async () => {
      server.use(
        http.post('*/create-bot', () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to create bot' },
            { status: 400 }
          );
        })
      );

      const mockBot = {
        name: 'Test Bot',
        emailAddress: 'test@example.com',
        description: 'Test description',
      };

      const result = await createBot(mockBot);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateBot', () => {
    it('should successfully update a bot', async () => {
      const mockUpdate = {
        name: 'Updated Bot',
        description: 'Updated description',
      };

      const result = await updateBot(MOCK_BOTS[0].id, mockUpdate);

      expect(result.success).toBe(true);
      expect(result.bot).toBeDefined();
      if (result.success && result.bot) {
        expect(result.bot.name).toBe(mockUpdate.name);
      }
    });

    it('should handle update errors', async () => {
      server.use(
        http.patch('*', () => {
          return HttpResponse.json(
            { error: 'Update failed' },
            { status: 400 }
          );
        })
      );

      const result = await updateBot('invalid-id', { name: 'Test' });
      expect(result.success).toBe(false);
    });
  });

  describe('deleteBot', () => {
    it('should successfully delete a bot', async () => {
      const result = await deleteBot(MOCK_BOTS[0].id);
      expect(result.success).toBe(true);
    });

    it('should handle deletion errors', async () => {
      server.use(
        http.delete('*', () => {
          return HttpResponse.json(
            { error: 'Deletion failed' },
            { status: 400 }
          );
        })
      );

      const result = await deleteBot('invalid-id');
      expect(result.success).toBe(false);
    });
  });
});