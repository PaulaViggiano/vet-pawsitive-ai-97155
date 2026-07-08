import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MascotaForm } from './MascotaForm';
import { Mascota, MascotaFormData } from '@/hooks/useMascotas';

interface MascotaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mascota?: Mascota | null;
  onSave: (data: MascotaFormData) => Promise<boolean>;
  isLoading?: boolean;
}

export function MascotaFormDialog({
  open,
  onOpenChange,
  mascota,
  onSave,
  isLoading = false,
}: MascotaFormDialogProps) {
  const handleSave = async (data: MascotaFormData): Promise<boolean> => {
    const success = await onSave(data);
    if (success) {
      onOpenChange(false);
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mascota ? 'Editar Mascota' : 'Nueva Mascota'}
          </DialogTitle>
        </DialogHeader>
        <MascotaForm
          initialData={mascota || undefined}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
