-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for leads table (assuming public access for demo purposes)
CREATE POLICY "Allow public read access to leads" 
ON leads FOR SELECT 
USING (true);

-- Fix handle_message_conversation function to have search_path
CREATE OR REPLACE FUNCTION public.handle_message_conversation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  conversation_record public.conversations%ROWTYPE;
BEGIN
  -- Try to find existing conversation
  SELECT * INTO conversation_record
  FROM public.conversations
  WHERE user_id = NEW.user_id AND whatsapp_number = (
    SELECT whatsapp_number FROM public.conversations WHERE id = NEW.conversation_id
  );

  -- Update conversation with latest message info
  UPDATE public.conversations
  SET 
    last_message = COALESCE(NEW.message_text, 'Archivo adjunto'),
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$function$;