-- Fix appointments table: add foreign key to patients and fix time columns
ALTER TABLE appointments 
  DROP COLUMN start_time,
  DROP COLUMN end_time;

ALTER TABLE appointments
  ADD COLUMN start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ADD COLUMN end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Add foreign key to patients table
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_patient
  FOREIGN KEY (patient_id) 
  REFERENCES patients(id) 
  ON DELETE SET NULL;