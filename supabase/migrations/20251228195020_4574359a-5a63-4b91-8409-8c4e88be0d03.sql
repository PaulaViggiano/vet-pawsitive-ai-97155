-- Enable full replica identity for realtime
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;