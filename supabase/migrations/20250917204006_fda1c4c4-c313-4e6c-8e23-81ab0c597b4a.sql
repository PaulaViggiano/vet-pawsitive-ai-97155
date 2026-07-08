-- Fix security warnings by setting proper search_path on functions
CREATE OR REPLACE FUNCTION public.handle_message_conversation()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search_path for find_or_create_conversation function
CREATE OR REPLACE FUNCTION public.find_or_create_conversation(
  p_user_id UUID,
  p_whatsapp_number TEXT,
  p_pushname TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE user_id = p_user_id AND whatsapp_number = p_whatsapp_number;

  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (user_id, whatsapp_number, pushname)
    VALUES (p_user_id, p_whatsapp_number, p_pushname)
    RETURNING id INTO conversation_id;
  ELSE
    -- Update pushname if provided and different
    IF p_pushname IS NOT NULL THEN
      UPDATE public.conversations
      SET pushname = p_pushname, updated_at = NOW()
      WHERE id = conversation_id AND (pushname IS NULL OR pushname != p_pushname);
    END IF;
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search_path for handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, clinic_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'veterinario'),
    COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Mi Clínica Veterinaria')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;