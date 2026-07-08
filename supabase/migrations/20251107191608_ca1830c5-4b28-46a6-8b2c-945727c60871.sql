-- Tabla de Owners (Dueños)
CREATE TABLE public.owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  relationship TEXT,
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Mascotas
CREATE TABLE public.mascotas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  especie TEXT NOT NULL,
  raza TEXT,
  fecha_nacimiento DATE,
  color TEXT,
  microchip TEXT,
  genero TEXT,
  alergias TEXT[],
  condiciones_cronicas TEXT[],
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'fallecido')),
  foto_url TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de relación Mascota-Dueño (many-to-many)
CREATE TABLE public.mascota_duenos (
  mascota_id UUID NOT NULL REFERENCES public.mascotas(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  es_principal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (mascota_id, owner_id)
);

-- Tabla de Patients (sistema antiguo - mantener por compatibilidad)
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'fallecido')),
  phone TEXT,
  email TEXT,
  gender TEXT,
  color TEXT,
  microchip TEXT,
  address TEXT,
  emergency_contact TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Registros Médicos
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  veterinarian TEXT NOT NULL,
  symptoms TEXT,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  notes TEXT,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
  medications TEXT[],
  weight NUMERIC(6,2),
  temperature NUMERIC(4,1),
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  next_appointment TIMESTAMP WITH TIME ZONE,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Base de Conocimiento
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de Contactos del Bot
CREATE TABLE public.bot_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejor performance
CREATE INDEX idx_owners_user_id ON public.owners(user_id);
CREATE INDEX idx_mascota_duenos_mascota_id ON public.mascota_duenos(mascota_id);
CREATE INDEX idx_mascota_duenos_owner_id ON public.mascota_duenos(owner_id);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_date ON public.medical_records(date DESC);
CREATE INDEX idx_knowledge_base_user_id ON public.knowledge_base(user_id);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_bot_contacts_user_id ON public.bot_contacts(user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON public.owners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mascotas_updated_at BEFORE UPDATE ON public.mascotas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_contacts_updated_at BEFORE UPDATE ON public.bot_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mascota_duenos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_contacts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Owners
CREATE POLICY "Users can view all owners" ON public.owners
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create owners" ON public.owners
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update owners" ON public.owners
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete owners" ON public.owners
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Mascotas
CREATE POLICY "Users can view all mascotas" ON public.mascotas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create mascotas" ON public.mascotas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update mascotas" ON public.mascotas
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete mascotas" ON public.mascotas
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Mascota_Duenos
CREATE POLICY "Users can view all mascota_duenos" ON public.mascota_duenos
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create mascota_duenos" ON public.mascota_duenos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update mascota_duenos" ON public.mascota_duenos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete mascota_duenos" ON public.mascota_duenos
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Patients
CREATE POLICY "Users can view all patients" ON public.patients
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create patients" ON public.patients
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update patients" ON public.patients
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete patients" ON public.patients
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Medical Records
CREATE POLICY "Users can view all medical_records" ON public.medical_records
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create medical_records" ON public.medical_records
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update medical_records" ON public.medical_records
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete medical_records" ON public.medical_records
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Knowledge Base
CREATE POLICY "Users can view their own knowledge_base" ON public.knowledge_base
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own knowledge_base" ON public.knowledge_base
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge_base" ON public.knowledge_base
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge_base" ON public.knowledge_base
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para Bot Contacts
CREATE POLICY "Users can view their own bot_contacts" ON public.bot_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot_contacts" ON public.bot_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot_contacts" ON public.bot_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot_contacts" ON public.bot_contacts
  FOR DELETE USING (auth.uid() = user_id);