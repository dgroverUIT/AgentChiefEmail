/*
  # Add OpenAI Integration Fields

  1. Changes
    - Add OpenAI-specific columns to bots table
    - Set default values for new columns
    - Add index for assistant ID lookups
*/

-- Add OpenAI-specific columns to bots table if they don't exist
DO $$ 
BEGIN
  -- Add openai_assistant_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bots' AND column_name = 'openai_assistant_id'
  ) THEN
    ALTER TABLE bots ADD COLUMN openai_assistant_id text;
  END IF;

  -- Add openai_model column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bots' AND column_name = 'openai_model'
  ) THEN
    ALTER TABLE bots ADD COLUMN openai_model text NOT NULL DEFAULT 'gpt-4-turbo-preview';
  END IF;

  -- Add openai_config column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bots' AND column_name = 'openai_config'
  ) THEN
    ALTER TABLE bots ADD COLUMN openai_config jsonb NOT NULL DEFAULT '{}';
  END IF;

  -- Add openai_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bots' AND column_name = 'openai_status'
  ) THEN
    ALTER TABLE bots ADD COLUMN openai_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Create index for OpenAI assistant ID if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'bots' AND indexname = 'idx_bots_openai_assistant'
  ) THEN
    CREATE INDEX idx_bots_openai_assistant ON bots(openai_assistant_id);
  END IF;
END $$;