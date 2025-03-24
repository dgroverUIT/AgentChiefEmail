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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_bot_created ON bots;

CREATE TRIGGER on_bot_created
  AFTER INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION notify_bot_created();