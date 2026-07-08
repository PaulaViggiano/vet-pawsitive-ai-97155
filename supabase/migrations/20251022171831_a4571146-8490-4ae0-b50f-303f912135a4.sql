-- Habilitar RLS en las tablas que faltan
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Agregar política para n8n_chat_histories (permitir todo para usuarios autenticados)
CREATE POLICY "Allow all for authenticated users" ON public.n8n_chat_histories
  FOR ALL USING (auth.role() = 'authenticated');