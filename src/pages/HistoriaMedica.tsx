import React, { useState } from 'react';
import { MedicalRecordForm } from '@/components/medical/MedicalRecordForm';
import { CreateMedicalRecordModal } from '@/components/medical/CreateMedicalRecordModal';
import { MedicalRecordList } from '@/components/medical/MedicalRecordList';
import { MedicalRecordDetail } from '@/components/medical/MedicalRecordDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, Filter, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMedicalRecords } from '@/hooks/useMedicalRecords';
import { useMascotas } from '@/hooks/useMascotas';
import { MedicalRecord } from '@/components/medical/MedicalRecordList';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

export default function HistoriaMedica() {
  const [showForm, setShowForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MedicalRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    status: 'all'
  });
  const [searchParams] = useSearchParams();
  
  const { 
    records, 
    isLoading, 
    isSaving, 
    createRecord, 
    updateRecord, 
    deleteRecord 
  } = useMedicalRecords();

  const { mascotas } = useMascotas();

  const { user } = useAuth();
  const { toast } = useToast();

  const patientFilter = searchParams.get('patient');

  const handleCreateNew = () => {
    setEditingRecord(null);
    setShowCreateModal(true);
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleView = (record: MedicalRecord) => {
    setViewingRecord(record);
    setShowDetail(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, formData);
      } else {
        await createRecord(formData);
      }
      
      setShowForm(false);
      setShowCreateModal(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error saving medical record:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      await deleteRecord(deletingRecord.id);
      setDeletingRecord(null);
    } catch (error) {
      console.error('Error deleting medical record:', error);
    }
  };

  const handleEditFromDetail = () => {
    if (viewingRecord) {
      setEditingRecord(viewingRecord);
      setShowDetail(false);
      setShowForm(true);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Aquí se podría implementar la lógica de búsqueda
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Aquí se podría implementar la lógica de filtrado
  };

  // Filtrar registros basado en búsqueda y filtros
  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchQuery || 
      record.patient?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.symptoms?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filters.type === 'all' || record.type === filters.type;
    const matchesPriority = filters.priority === 'all' || record.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || record.status === filters.status;

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Historia Médica</h1>
          <p className="text-muted-foreground">Gestiona los registros médicos de los pacientes</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-vet-primary hover:bg-vet-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Historia Clínica
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por paciente, diagnóstico..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de consulta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="consulta">Consulta</SelectItem>
                <SelectItem value="vacunacion">Vacunación</SelectItem>
                <SelectItem value="cirugia">Cirugía</SelectItem>
                <SelectItem value="emergencia">Emergencia</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros o vista de detalle */}
      {showDetail && viewingRecord ? (
        <MedicalRecordDetail
          record={viewingRecord}
          onEdit={handleEditFromDetail}
          onClose={() => {
            setShowDetail(false);
            setViewingRecord(null);
          }}
        />
      ) : (
        <MedicalRecordList
          records={filteredRecords}
          loading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(id) => {
            const record = records.find(r => r.id === id);
            if (record) setDeletingRecord(record);
          }}
        />
      )}

      {/* Modal mejorado para crear nueva historia clínica */}
      <CreateMedicalRecordModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSave={handleSave}
        availablePatients={mascotas.map(m => {
          const dueñoPrincipal = m.duenos?.find(d => d.es_principal) || m.duenos?.[0];
          return {
            id: m.id,
            name: m.nombre,
            owner: dueñoPrincipal?.name || 'Sin dueño',
            species: m.especie,
            breed: m.raza || '',
            phone: dueñoPrincipal?.phone || ''
          };
        })}
        initialPatientId={patientFilter || undefined}
      />

      {/* Dialog para editar historia clínica */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Editar Historia Médica' : 'Nueva Historia Médica'}
            </DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            patientId={patientFilter || ''}
            onSubmit={handleSave}
            onCancel={() => setShowForm(false)}
            isLoading={isSaving}
            initialData={editingRecord ? {
              ...editingRecord,
              weight: editingRecord.weight?.toString() || '',
              temperature: editingRecord.temperature?.toString() || '',
              heart_rate: editingRecord.heart_rate?.toString() || '',
              respiratory_rate: editingRecord.respiratory_rate?.toString() || ''
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!deletingRecord} onOpenChange={() => setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la historia médica.
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
    </div>
  );
}