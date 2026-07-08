-- Enable Row Level Security on all public tables

-- Enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bot_contacts table
ALTER TABLE public.bot_contacts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on google_calendar_tokens table
ALTER TABLE public.google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Enable RLS on knowledge_base table
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mascota_duenos table
ALTER TABLE public.mascota_duenos ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mascotas table
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;

-- Enable RLS on medical_records table
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Enable RLS on owners table
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;