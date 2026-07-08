-- Hacer user_id opcional en todas las tablas (excepto profiles)
ALTER TABLE public.appointments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.automations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.conversations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.knowledge_base ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.mascotas ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.medical_records ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.messages ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.owners ALTER COLUMN user_id DROP NOT NULL;

-- Eliminar todas las políticas RLS restrictivas existentes
DROP POLICY IF EXISTS "Users can manage own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own automations" ON public.automations;
DROP POLICY IF EXISTS "Users can delete their own automations" ON public.automations;
DROP POLICY IF EXISTS "Users can update their own automations" ON public.automations;
DROP POLICY IF EXISTS "Users can view own automations" ON public.automations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create their own knowledge base entries" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can delete their own knowledge base entries" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can update their own knowledge base entries" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can view own knowledge base entries" ON public.knowledge_base;
DROP POLICY IF EXISTS "Users can create own mascota_duenos" ON public.mascota_duenos;
DROP POLICY IF EXISTS "Users can delete own mascota_duenos" ON public.mascota_duenos;
DROP POLICY IF EXISTS "Users can update own mascota_duenos" ON public.mascota_duenos;
DROP POLICY IF EXISTS "Users can view own mascota_duenos" ON public.mascota_duenos;
DROP POLICY IF EXISTS "Users can create own mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Users can delete own mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Users can update own mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Users can view own mascotas" ON public.mascotas;
DROP POLICY IF EXISTS "Users can manage own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can view own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can create their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create own owners" ON public.owners;
DROP POLICY IF EXISTS "Users can delete own owners" ON public.owners;
DROP POLICY IF EXISTS "Users can update own owners" ON public.owners;
DROP POLICY IF EXISTS "Users can view own owners" ON public.owners;
DROP POLICY IF EXISTS "Users can manage own patients" ON public.patients;
DROP POLICY IF EXISTS "Users can view own patients" ON public.patients;

-- Crear políticas RLS abiertas para todos los usuarios autenticados
CREATE POLICY "Allow all for authenticated users" ON public.appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.automations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.conversations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.knowledge_base
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.mascota_duenos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.mascotas
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.medical_records
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.owners
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.patients
  FOR ALL USING (auth.role() = 'authenticated');