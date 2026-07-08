-- Enable RLS on tables that need it
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Fix the function that doesn't have search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;