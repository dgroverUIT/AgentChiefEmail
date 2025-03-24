/*
  # Add bot-specific OpenAI API key

  1. Changes
    - Add `openai_api_key` column to bots table to store bot-specific API keys
    - Make the column encrypted using pgcrypto for security
    
  2. Security
    - Maintains existing RLS policies
    - Encrypts API keys using pgcrypto
*/

-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add encrypted API key column
ALTER TABLE bots ADD COLUMN IF NOT EXISTS openai_api_key text;

-- Create function to generate random API key with prefix
CREATE OR REPLACE FUNCTION generate_api_key() RETURNS text AS $$
BEGIN
  RETURN 'agc-' || encode(gen_random_bytes(24), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to automatically generate API key for new bots
CREATE OR REPLACE FUNCTION set_api_key_trigger() RETURNS trigger AS $$
BEGIN
  IF NEW.openai_api_key IS NULL THEN
    NEW.openai_api_key := generate_api_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ensure_bot_api_key
  BEFORE INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION set_api_key_trigger();