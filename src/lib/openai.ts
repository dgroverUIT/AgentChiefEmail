import OpenAI from 'openai';
import { supabase } from './supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable browser usage
});

export interface CreateBotParams {
  name: string;
  description: string;
  instructions?: string;
  model?: string;
}

export async function createOpenAIAssistant({
  name,
  description,
  instructions = "You are an AI email assistant. Respond professionally and helpfully to customer inquiries.",
  model = "gpt-4-turbo-preview"
}: CreateBotParams) {
  try {
    // Create OpenAI Assistant
    const assistant = await openai.beta.assistants.create({
      name,
      description,
      instructions,
      model,
      tools: [{ type: "retrieval" }],
    });

    return {
      success: true,
      assistantId: assistant.id,
      model: assistant.model,
    };
  } catch (error) {
    console.error('Error creating OpenAI assistant:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function updateOpenAIAssistant(assistantId: string, params: Partial<CreateBotParams>) {
  try {
    const assistant = await openai.beta.assistants.update(
      assistantId,
      {
        name: params.name,
        description: params.description,
        instructions: params.instructions,
        model: params.model,
      }
    );

    return {
      success: true,
      assistantId: assistant.id,
      model: assistant.model,
    };
  } catch (error) {
    console.error('Error updating OpenAI assistant:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function deleteOpenAIAssistant(assistantId: string) {
  try {
    await openai.beta.assistants.del(assistantId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting OpenAI assistant:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}