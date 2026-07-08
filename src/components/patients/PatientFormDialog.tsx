import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PatientForm } from './PatientForm';
import { Mascota as Patient, MascotaFormData as PatientFormData } from '@/hooks/useMascotas';

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSave: (data: PatientFormData) => Promise<boolean>;
  isLoading?: boolean;
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSave,
  isLoading = false,
}: PatientFormDialogProps) {
  const handleSave = async (data: PatientFormData) => {
    const success = await onSave(data);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? 'Editar Paciente' : 'Nuevo Paciente'}
          </DialogTitle>
        </DialogHeader>
        <PatientForm
          initialData={patient || undefined}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
