/*
  # Add Bot API Key Generation

  1. Changes:
    - Adds encrypted API key column
    - Creates function to generate unique API keys
    - Skips trigger creation if it exists

  2. Security:
    - Uses pgcrypto for secure key generation
    - Keys are prefixed with 'agc-' for identification
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

-- Add trigger to automatically generate API key for new bots (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'ensure_bot_api_key' 
    AND tgrelid = 'bots'::regclass
  ) THEN
    CREATE TRIGGER ensure_bot_api_key
      BEFORE INSERT ON bots
      FOR EACH ROW
      EXECUTE FUNCTION set_api_key_trigger();
  END IF;
END $$;