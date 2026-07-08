import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MascotaGrid } from '@/components/patients/MascotaGrid';
import { MascotaFormDialog } from '@/components/patients/MascotaFormDialog';
import { MascotaDetailDialog } from '@/components/patients/MascotaDetailDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMascotas, Mascota } from '@/hooks/useMascotas';

export default function Pacientes() {
  const { mascotas, loading, saving, createMascota, updateMascota, deleteMascota } = useMascotas();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  const [viewingMascota, setViewingMascota] = useState<Mascota | null>(null);
  const [deletingMascota, setDeletingMascota] = useState<Mascota | null>(null);
  
  const highlightedMascotaId = searchParams.get('highlight');
  
  useEffect(() => {
    if (highlightedMascotaId && !loading) {
      const element = document.getElementById(`mascota-${highlightedMascotaId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setSearchParams({});
        }, 2000);
      }
    }
  }, [highlightedMascotaId, loading, setSearchParams]);

  const handleCreateNew = () => {
    setEditingMascota(null);
    setShowForm(true);
  };

  const handleEdit = (mascota: Mascota) => {
    setEditingMascota(mascota);
    setShowForm(true);
  };

  const handleViewDetails = (mascota: Mascota) => {
    setViewingMascota(mascota);
    setShowDetailDialog(true);
  };

  const handleViewHistory = (mascota: Mascota) => {
    navigate(`/historia-medica?patient=${mascota.id}`);
  };

  const handleWhatsApp = (mascota: Mascota) => {
    const dueñoPrincipal = mascota.duenos?.find(d => d.es_principal) || mascota.duenos?.[0];
    const phone = dueñoPrincipal?.phone;
    
    if (phone) {
      const message = `Hola ${dueñoPrincipal.name}, es la clínica veterinaria. Nos comunicamos respecto a ${mascota.nombre}.`;
      const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      let success;
      if (editingMascota) {
        success = await updateMascota(editingMascota.id, formData);
      } else {
        success = await createMascota(formData);
      }
      
      if (success) {
        setShowForm(false);
        setEditingMascota(null);
      }
      
      return success;
    } catch (error) {
      console.error('Error al guardar:', error);
      return false;
    }
  };

  const handleDelete = async () => {
    if (!deletingMascota) return;
    const success = await deleteMascota(deletingMascota.id);
    if (success) {
      setDeletingMascota(null);
    }
  };

  return (
    <>
      <MascotaGrid
        mascotas={mascotas}
        isLoading={loading}
        onCreateNew={handleCreateNew}
        onViewHistory={handleViewHistory}
        onWhatsApp={handleWhatsApp}
        onEdit={handleEdit}
        onDelete={(mascota) => setDeletingMascota(mascota)}
        onViewDetails={handleViewDetails}
        highlightedId={highlightedMascotaId || undefined}
      />

      <MascotaDetailDialog
        mascota={viewingMascota}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      <MascotaFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        mascota={editingMascota}
        onSave={handleSave}
        isLoading={saving}
      />

      <AlertDialog open={!!deletingMascota} onOpenChange={() => setDeletingMascota(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la mascota "{deletingMascota?.nombre}" 
              y todos sus registros médicos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
