/*
  # Add OpenAI configuration to bots table

  1. Changes
    - Add OpenAI-specific columns to bots table:
      - `openai_assistant_id`: Stores the OpenAI Assistant ID
      - `openai_model`: The model to use (e.g., gpt-4-turbo-preview)
      - `openai_config`: JSON field for additional configuration
      - `openai_status`: Status of the OpenAI assistant

  2. Security
    - Maintains existing RLS policies
*/

-- Add OpenAI-specific columns to bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS openai_assistant_id text;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS openai_model text NOT NULL DEFAULT 'gpt-4-turbo-preview';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS openai_config jsonb NOT NULL DEFAULT '{}';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS openai_status text NOT NULL DEFAULT 'pending';

-- Create index for OpenAI assistant ID
CREATE INDEX IF NOT EXISTS idx_bots_openai_assistant ON bots(openai_assistant_id);