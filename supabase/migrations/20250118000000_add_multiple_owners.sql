-- Migración para implementar múltiples dueños de mascotas
-- Crear tabla de dueños
CREATE TABLE public.pet_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  relationship TEXT DEFAULT 'propietario' CHECK (relationship IN ('propietario', 'cuidador', 'familiar', 'veterinario', 'otro')),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de relación many-to-many entre pacientes y dueños
CREATE TABLE public.patient_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.pet_owners(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, owner_id)
);

-- Habilitar RLS para pet_owners
ALTER TABLE public.pet_owners ENABLE ROW LEVEL SECURITY;

-- Crear políticas para pet_owners
CREATE POLICY "Users can view own pet owners"
  ON public.pet_owners
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pet owners"
  ON public.pet_owners
  FOR ALL
  USING (auth.uid() = user_id);

-- Habilitar RLS para patient_owners
ALTER TABLE public.patient_owners ENABLE ROW LEVEL SECURITY;

-- Crear políticas para patient_owners
CREATE POLICY "Users can view own patient owners"
  ON public.patient_owners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.id = patient_owners.patient_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own patient owners"
  ON public.patient_owners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p 
      WHERE p.id = patient_owners.patient_id 
      AND p.user_id = auth.uid()
    )
  );

-- Migrar datos existentes: crear dueños a partir de owner_name en patients
INSERT INTO public.pet_owners (user_id, name, is_primary)
SELECT DISTINCT 
  p.user_id,
  p.owner_name,
  true
FROM public.patients p
WHERE p.owner_name IS NOT NULL AND p.owner_name != '';

-- Crear relaciones patient_owners para los datos migrados
INSERT INTO public.patient_owners (patient_id, owner_id, is_primary)
SELECT 
  p.id,
  po.id,
  true
FROM public.patients p
JOIN public.pet_owners po ON po.name = p.owner_name AND po.user_id = p.user_id
WHERE p.owner_name IS NOT NULL AND p.owner_name != '';

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para updated_at
CREATE TRIGGER handle_pet_owners_updated_at
  BEFORE UPDATE ON public.pet_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Agregar índices para mejorar rendimiento
CREATE INDEX idx_pet_owners_user_id ON public.pet_owners(user_id);
CREATE INDEX idx_pet_owners_name ON public.pet_owners(name);
CREATE INDEX idx_patient_owners_patient_id ON public.patient_owners(patient_id);
CREATE INDEX idx_patient_owners_owner_id ON public.patient_owners(owner_id);

-- Comentarios para documentación
COMMENT ON TABLE public.pet_owners IS 'Tabla de dueños de mascotas con información de contacto';
COMMENT ON TABLE public.patient_owners IS 'Tabla de relación many-to-many entre pacientes y dueños';
COMMENT ON COLUMN public.pet_owners.relationship IS 'Tipo de relación con la mascota';
COMMENT ON COLUMN public.pet_owners.is_primary IS 'Indica si es el dueño principal';
COMMENT ON COLUMN public.patient_owners.is_primary IS 'Indica si es el dueño principal para esta mascota específica';