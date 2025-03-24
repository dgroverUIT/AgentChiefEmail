/*
  # Simple Bot Creation Trigger
  
  1. Changes
    - Creates trigger function to call edge function
    - Sets up trigger on bots table
    
  2. Details
    - Calls create_assistant_v2 edge function
    - Passes bot_name, bot_email, and bot_description
    - No authentication or encryption needed
*/

-- Create trigger function
CREATE OR REPLACE FUNCTION notify_bot_created()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_response JSONB;
BEGIN
  -- Call the edge function with three parameters
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_bot_created ON bots;

-- Create trigger
CREATE TRIGGER on_bot_created
  AFTER INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION notify_bot_created();