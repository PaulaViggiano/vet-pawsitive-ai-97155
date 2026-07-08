-- Eliminar tablas relacionadas con automatizaciones, conversaciones/whatsapp y citas
DROP TABLE IF EXISTS public.automations CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Eliminar funciones relacionadas
DROP FUNCTION IF EXISTS public.find_or_create_conversation(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.handle_message_conversation() CASCADE;