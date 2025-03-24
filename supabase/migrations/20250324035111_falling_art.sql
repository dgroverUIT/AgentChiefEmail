/*
  # Create Assistant Trigger Migration
  
  1. Creates trigger function to call create_assistant_v2 edge function
  2. Adds trigger to bots table
  3. Ensures function logs table exists but avoids policy conflicts
*/

-- Create function logs table if not exists
CREATE TABLE IF NOT EXISTS function_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  request_data jsonb,
  response_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on function logs if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'function_logs'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE function_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow service role to insert logs" ON function_logs;

-- Create policy for function logs
CREATE POLICY "Allow service role to insert logs"
  ON function_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create trigger function
CREATE OR REPLACE FUNCTION notify_bot_created()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_response JSONB;
BEGIN
  -- Call the edge function
  edge_function_response := net.http_post(
    url := 'https://ijoajnhusxfzyytyxgnl.supabase.co/functions/v1/create_assistant_v2',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'bot_name', NEW.name,
      'bot_email', NEW.email_address,
      'bot_description', COALESCE(NEW.description, '')
    )
  );

  -- Log the request and response
  INSERT INTO function_logs (
    function_name,
    request_data,
    response_data
  ) VALUES (
    'create_assistant_v2',
    jsonb_build_object(
      'bot_name', NEW.name,
      'bot_email', NEW.email_address,
      'bot_description', COALESCE(NEW.description, '')
    ),
    edge_function_response
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_bot_created ON bots;

CREATE TRIGGER on_bot_created
  AFTER INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION notify_bot_created();