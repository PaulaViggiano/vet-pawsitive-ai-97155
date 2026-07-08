-- Add modalidad field to appointments table
ALTER TABLE appointments ADD COLUMN modalidad text NOT NULL DEFAULT 'presencial' CHECK (modalidad IN ('presencial', 'virtual'));