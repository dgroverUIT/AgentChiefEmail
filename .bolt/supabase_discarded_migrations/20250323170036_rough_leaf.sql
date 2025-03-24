/*
  # Add Bot Creation Notification Trigger

  1. Changes
    - Creates a function to notify the edge function when a bot is created
    - Adds a trigger to automatically call the function on bot insertion
    
  2. Security
    - Function runs with SECURITY DEFINER to ensure proper permissions
    - Uses secure connection settings
*/

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS "http";

-- Create the notification function
CREATE OR REPLACE FUNCTION notify_edge_function()
RETURNS trigger AS $$
DECLARE
  edge_function_url text := 'https://ijoajnhusxfzyytyxgnl.supabase.co/functions/v1/bot-created';
  edge_function_key text := 'your-edge-function-key'; -- This will be replaced with actual key
BEGIN
  -- Construct the payload
  PERFORM
    http_post(
      url := edge_function_url,
      body := json_build_object(
        'bot_id', NEW.id,
        'name', NEW.name,
        'email_address', NEW.email_address,
        'created_at', NEW.created_at
      )::text,
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || edge_function_key
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS notify_bot_created ON bots;
CREATE TRIGGER notify_bot_created
  AFTER INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION notify_edge_function();