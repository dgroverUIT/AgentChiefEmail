/*
  # Fix Bot Creation Notification Trigger

  1. Changes
    - Removes the http_post function dependency
    - Creates a simpler notification trigger using pg_notify
    - Updates the trigger to use the new approach
    
  2. Security
    - Uses built-in PostgreSQL notification system
    - Maintains security context
*/

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS notify_bot_created ON bots;
DROP FUNCTION IF EXISTS notify_edge_function;

-- Create new notification function using pg_notify
CREATE OR REPLACE FUNCTION notify_bot_created()
RETURNS trigger AS $$
BEGIN
  -- Send notification with bot data as JSON
  PERFORM pg_notify(
    'bot_created',
    json_build_object(
      'bot_id', NEW.id,
      'name', NEW.name,
      'email_address', NEW.email_address,
      'created_at', NEW.created_at
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the new trigger
CREATE TRIGGER notify_bot_created
  AFTER INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION notify_bot_created();