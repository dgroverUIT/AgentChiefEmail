/*
  # Authentication and Encryption System

  1. Changes
    - Enable pgcrypto extension
    - Create encryption keys table with RLS
    - Create encryption helper functions
    - Update bot trigger with auth using stored key
    - Encrypt existing API keys
  
  2. Security
    - Enable RLS on encryption_keys table
    - Add policy for service role access
    - All functions are SECURITY DEFINER
*/

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encryption keys table
CREATE TABLE IF NOT EXISTS encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on encryption keys
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow service role full access to encryption keys" ON encryption_keys;

-- Create policy for encryption keys
CREATE POLICY "Allow service role full access to encryption keys"
  ON encryption_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert default encryption key if it doesn't exist
INSERT INTO encryption_keys (key_name, key_value, created_by)
SELECT 
  'default',
  encode(gen_random_bytes(32), 'base64'),
  auth.uid()
WHERE NOT EXISTS (
  SELECT 1 FROM encryption_keys WHERE key_name = 'default'
);

-- Create encryption helper function
CREATE OR REPLACE FUNCTION encrypt_secret(input_secret text, input_key_name text DEFAULT 'default')
RETURNS text AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key
  SELECT ek.key_value INTO encryption_key
  FROM encryption_keys ek
  WHERE ek.key_name = input_key_name;

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found';
  END IF;

  -- Encrypt and encode
  RETURN 'base64:' || encode(
    pgp_sym_encrypt(
      input_secret,
      encryption_key
    )::bytea,
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create decryption helper function
CREATE OR REPLACE FUNCTION decrypt_secret(input_secret text, input_key_name text DEFAULT 'default')
RETURNS text AS $$
DECLARE
  encryption_key text;
  decoded_secret bytea;
BEGIN
  -- Check if encrypted
  IF NOT input_secret LIKE 'base64:%' THEN
    RETURN input_secret;
  END IF;

  -- Get encryption key
  SELECT ek.key_value INTO encryption_key
  FROM encryption_keys ek
  WHERE ek.key_name = input_key_name;

  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found';
  END IF;

  -- Remove prefix and decrypt
  decoded_secret := decode(substring(input_secret FROM 8), 'base64');
  RETURN pgp_sym_decrypt(decoded_secret, encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create secure function to call edge function
CREATE OR REPLACE FUNCTION call_edge_function_with_auth()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_response JSONB;
  service_role_key text;
BEGIN
  -- Get service role key from encryption keys
  SELECT key_value INTO service_role_key
  FROM encryption_keys
  WHERE key_name = 'service_role_key'
  LIMIT 1;

  IF service_role_key IS NULL THEN
    RAISE EXCEPTION 'Service role key not found in encryption_keys';
  END IF;

  -- Call the edge function with auth header
  edge_function_response := net.http_post(
    url := 'https://ijoajnhusxfzyytyxgnl.supabase.co/functions/v1/bot-created',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'bot_id', NEW.id,
      'name', NEW.name,
      'description', NEW.description
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_bot_created ON bots;

-- Create new trigger with auth
CREATE TRIGGER on_bot_created
  AFTER INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION call_edge_function_with_auth();

-- Update existing bots table to ensure api key column is encrypted
DO $$
BEGIN
  -- Only run if the column exists and contains unencrypted data
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bots'
    AND column_name = 'openai_api_key'
  ) THEN
    -- Update existing api keys to be encrypted
    UPDATE bots
    SET openai_api_key = encrypt_secret(openai_api_key)
    WHERE openai_api_key IS NOT NULL
    AND openai_api_key NOT LIKE 'base64:%';
  END IF;
END $$;