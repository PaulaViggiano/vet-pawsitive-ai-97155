-- Add owners column to patients table (JSONB array)
ALTER TABLE patients
  ADD COLUMN owners JSONB DEFAULT '[]'::jsonb;

-- Migrate existing data from patient_owners and pet_owners to patients.owners
UPDATE patients p
SET owners = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', po.id,
        'name', po.name,
        'phone', po.phone,
        'email', po.email,
        'address', po.address,
        'emergency_contact', po.emergency_contact,
        'relationship', po.relationship,
        'is_primary', po.is_primary,
        'notes', po.notes
      )
    )
    FROM patient_owners pao
    JOIN pet_owners po ON po.id = pao.owner_id
    WHERE pao.patient_id = p.id
  ),
  '[]'::jsonb
);

-- Drop the old tables
DROP TABLE IF EXISTS patient_owners CASCADE;
DROP TABLE IF EXISTS pet_owners CASCADE;