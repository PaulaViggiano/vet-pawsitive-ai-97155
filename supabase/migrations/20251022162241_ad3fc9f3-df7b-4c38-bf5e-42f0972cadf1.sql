-- Create owners table
CREATE TABLE IF NOT EXISTS public.owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  relationship TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on owners table
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;

-- Create policies for owners
CREATE POLICY "Users can view own owners" 
ON public.owners FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own owners" 
ON public.owners FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own owners" 
ON public.owners FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own owners" 
ON public.owners FOR DELETE 
USING (auth.uid() = user_id);

-- Create patient_owners junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.patient_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, owner_id)
);

-- Enable RLS on patient_owners table
ALTER TABLE public.patient_owners ENABLE ROW LEVEL SECURITY;

-- Create policies for patient_owners
CREATE POLICY "Users can view own patient_owners" 
ON public.patient_owners FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = patient_owners.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can create own patient_owners" 
ON public.patient_owners FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = patient_owners.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can update own patient_owners" 
ON public.patient_owners FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = patient_owners.patient_id 
  AND patients.user_id = auth.uid()
));

CREATE POLICY "Users can delete own patient_owners" 
ON public.patient_owners FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.patients 
  WHERE patients.id = patient_owners.patient_id 
  AND patients.user_id = auth.uid()
));

-- Migrate existing data from patients.owners JSONB to new tables
DO $$
DECLARE
  patient_record RECORD;
  owner_record JSONB;
  new_owner_id UUID;
  is_first BOOLEAN;
BEGIN
  FOR patient_record IN 
    SELECT id, user_id, owners, owner_name 
    FROM public.patients 
    WHERE owners IS NOT NULL 
    AND jsonb_typeof(owners) = 'array'
  LOOP
    is_first := true;
    
    FOR owner_record IN 
      SELECT * FROM jsonb_array_elements(patient_record.owners)
    LOOP
      -- Insert owner
      INSERT INTO public.owners (user_id, name, phone, email, address, emergency_contact, relationship, notes)
      VALUES (
        patient_record.user_id,
        COALESCE(owner_record->>'name', patient_record.owner_name),
        owner_record->>'phone',
        owner_record->>'email',
        owner_record->>'address',
        owner_record->>'emergency_contact',
        owner_record->>'relationship',
        owner_record->>'notes'
      )
      RETURNING id INTO new_owner_id;
      
      -- Link patient to owner
      INSERT INTO public.patient_owners (patient_id, owner_id, is_primary)
      VALUES (patient_record.id, new_owner_id, COALESCE((owner_record->>'is_primary')::boolean, is_first));
      
      is_first := false;
    END LOOP;
  END LOOP;
END $$;

-- Remove owners column from patients table
ALTER TABLE public.patients DROP COLUMN IF EXISTS owners;

-- Create trigger for updated_at on owners
CREATE TRIGGER update_owners_updated_at
BEFORE UPDATE ON public.owners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();