-- Crear tabla mascotas
CREATE TABLE public.mascotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  especie TEXT NOT NULL,
  raza TEXT,
  fecha_nacimiento DATE,
  color TEXT,
  microchip TEXT,
  genero TEXT,
  alergias TEXT[] DEFAULT '{}',
  condiciones_cronicas TEXT[] DEFAULT '{}',
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'fallecido')),
  foto_url TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.mascotas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own mascotas"
  ON public.mascotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mascotas"
  ON public.mascotas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mascotas"
  ON public.mascotas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mascotas"
  ON public.mascotas FOR DELETE
  USING (auth.uid() = user_id);

-- Crear tabla de relación mascotas-dueños
CREATE TABLE public.mascota_duenos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mascota_id UUID NOT NULL REFERENCES public.mascotas(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  es_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mascota_id, owner_id)
);

-- Habilitar RLS
ALTER TABLE public.mascota_duenos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mascota_duenos
CREATE POLICY "Users can view own mascota_duenos"
  ON public.mascota_duenos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mascotas
      WHERE mascotas.id = mascota_duenos.mascota_id
      AND mascotas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own mascota_duenos"
  ON public.mascota_duenos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mascotas
      WHERE mascotas.id = mascota_duenos.mascota_id
      AND mascotas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own mascota_duenos"
  ON public.mascota_duenos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mascotas
      WHERE mascotas.id = mascota_duenos.mascota_id
      AND mascotas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own mascota_duenos"
  ON public.mascota_duenos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.mascotas
      WHERE mascotas.id = mascota_duenos.mascota_id
      AND mascotas.user_id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_mascotas_updated_at
  BEFORE UPDATE ON public.mascotas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();