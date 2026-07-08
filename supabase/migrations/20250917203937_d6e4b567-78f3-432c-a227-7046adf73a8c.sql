-- Create conversations table for WhatsApp conversations
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  whatsapp_number TEXT NOT NULL,
  pushname TEXT,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, whatsapp_number)
);

-- Create messages table for individual WhatsApp messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_text TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('recibido', 'enviado')),
  message_type TEXT NOT NULL DEFAULT 'texto' CHECK (message_type IN ('texto', 'imagen', 'audio', 'video', 'documento', 'sticker', 'location')),
  attachment_url TEXT,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view own conversations" 
ON public.conversations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view own messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create or update conversation when a message is inserted
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

  -- If conversation doesn't exist and we don't have conversation_id, we need the whatsapp_number
  -- This will be handled by the application layer to first create/find conversation
  
  -- Update conversation with latest message info
  UPDATE public.conversations
  SET 
    last_message = COALESCE(NEW.message_text, 'Archivo adjunto'),
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for handling conversation updates when messages are inserted
CREATE TRIGGER handle_message_conversation_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_message_conversation();

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_whatsapp_number ON public.conversations(whatsapp_number);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_direction ON public.messages(direction);

-- Create function to find or create conversation
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
$$ LANGUAGE plpgsql SECURITY DEFINER;