import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  Save, 
  X, 
  Stethoscope, 
  Thermometer, 
  Heart, 
  Wind,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CreateMedicalRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (record: MedicalRecordData) => void;
  availablePatients: Patient[];
  initialPatientId?: string;
}

interface MedicalRecordData {
  patientId: string;
  date: Date;
  type: 'consultas generales' | 'control de pulgas/garrapatas' | 'alergias' | 'urgencias' | 'Cytopoint' | 'piel y pelos' | 'otra';
  veterinarian: string;
  weight?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  notes: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'activo' | 'completado' | 'seguimiento';
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Patient {
  id: string;
  name: string;
  owner: string;
  species: string;
  breed: string;
  phone: string;
}

const recordTypes = [
  { value: 'consultas generales', label: 'Consultas Generales', icon: Stethoscope, color: 'bg-blue-100 text-blue-700' },
  { value: 'control de pulgas/garrapatas', label: 'Control de Pulgas/Garrapatas', icon: Heart, color: 'bg-green-100 text-green-700' },
  { value: 'alergias', label: 'Alergias', icon: Activity, color: 'bg-red-100 text-red-700' },
  { value: 'urgencias', label: 'Urgencias', icon: AlertCircle, color: 'bg-orange-100 text-orange-700' },
  { value: 'Cytopoint', label: 'Cytopoint', icon: FileText, color: 'bg-purple-100 text-purple-700' },
  { value: 'piel y pelos', label: 'Piel y Pelos', icon: Stethoscope, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'otra', label: 'Otra', icon: FileText, color: 'bg-gray-100 text-gray-700' }
];

const veterinarians = [
  'Dra. Andrea Hernández',
  'Dr. Miguel Santos',
  'Dra. Carmen López',
  'Dr. Roberto Martínez'
];

export function CreateMedicalRecordModal({ 
  open, 
  onOpenChange, 
  onSave, 
  availablePatients,
  initialPatientId 
}: CreateMedicalRecordModalProps) {
  const [formData, setFormData] = useState<Partial<MedicalRecordData>>({
    patientId: initialPatientId || '',
    date: new Date(),
    type: 'consultas generales',
    veterinarian: 'Dra. Andrea Hernández',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medications: [],
    notes: '',
    priority: 'media',
    status: 'activo'
  });

  const [dateOpen, setDateOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    initialPatientId ? availablePatients.find(p => p.id === initialPatientId) || null : null
  );
  const [newMedication, setNewMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  const updateField = (field: keyof MedicalRecordData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = availablePatients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      updateField('patientId', patient.id);
    }
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      const medications = [...(formData.medications || []), newMedication];
      updateField('medications', medications);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
    }
  };

  const removeMedication = (index: number) => {
    const medications = formData.medications?.filter((_, i) => i !== index) || [];
    updateField('medications', medications);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.date || !formData.symptoms || !formData.diagnosis) {
      return;
    }

    const record: MedicalRecordData = {
      patientId: formData.patientId!,
      date: formData.date!,
      type: formData.type || 'consultas generales',
      veterinarian: formData.veterinarian || 'Dra. Andrea Hernández',
      weight: formData.weight,
      temperature: formData.temperature,
      heartRate: formData.heartRate,
      respiratoryRate: formData.respiratoryRate,
      symptoms: formData.symptoms!,
      diagnosis: formData.diagnosis!,
      treatment: formData.treatment || '',
      medications: formData.medications || [],
      notes: formData.notes || '',
      priority: formData.priority || 'media',
      status: formData.status || 'activo'
    };

    onSave(record);
    onOpenChange(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja': return 'bg-green-100 text-green-700';
      case 'media': return 'bg-blue-100 text-blue-700';
      case 'alta': return 'bg-orange-100 text-orange-700';
      case 'urgente': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const selectedType = recordTypes.find(t => t.value === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Stethoscope className="h-6 w-6 text-vet-primary" />
            Nueva Historia Clínica
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select value={formData.patientId} onValueChange={handlePatientSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center space-x-2">
                            <Heart className="h-3 w-3" />
                            <span>{patient.name} - {patient.owner}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPatient && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <p><strong>Especie:</strong> {selectedPatient.species}</p>
                        <p><strong>Raza:</strong> {selectedPatient.breed}</p>
                        <p><strong>Propietario:</strong> {selectedPatient.owner}</p>
                        <p><strong>Teléfono:</strong> {selectedPatient.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          updateField('date', date);
                          setDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Consulta *</Label>
                  <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedType && (
                    <Badge className={selectedType.color}>
                      <selectedType.icon className="h-3 w-3 mr-1" />
                      {selectedType.label}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">🟢 Baja</SelectItem>
                      <SelectItem value="media">🔵 Media</SelectItem>
                      <SelectItem value="alta">🟠 Alta</SelectItem>
                      <SelectItem value="urgente">🔴 Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinario</Label>
                  <Select value={formData.veterinarian} onValueChange={(value) => updateField('veterinarian', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar veterinario" />
                    </SelectTrigger>
                    <SelectContent>
                      {veterinarians.map((vet) => (
                        <SelectItem key={vet} value={vet}>{vet}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signos vitales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Signos Vitales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    Peso (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) => updateField('weight', parseFloat(e.target.value) || undefined)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature" className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    Temperatura (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature || ''}
                    onChange={(e) => updateField('temperature', parseFloat(e.target.value) || undefined)}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heartRate" className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Freq. Cardíaca
                  </Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={formData.heartRate || ''}
                    onChange={(e) => updateField('heartRate', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate" className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    Freq. Respiratoria
                  </Label>
                  <Input
                    id="respiratoryRate"
                    type="number"
                    value={formData.respiratoryRate || ''}
                    onChange={(e) => updateField('respiratoryRate', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información clínica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Información Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Síntomas *</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => updateField('symptoms', e.target.value)}
                  placeholder="Describe los síntomas observados..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnóstico *</Label>
                <Textarea
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => updateField('diagnosis', e.target.value)}
                  placeholder="Diagnóstico médico..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Tratamiento</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => updateField('treatment', e.target.value)}
                  placeholder="Plan de tratamiento..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medicamentos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medicamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de medicamentos */}
              {formData.medications && formData.medications.length > 0 && (
                <div className="space-y-2">
                  {formData.medications.map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {med.dosage} - {med.frequency} por {med.duration}
                        </div>
                        {med.instructions && (
                          <div className="text-xs text-muted-foreground mt-1">{med.instructions}</div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Agregar medicamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-3 border rounded-lg">
                <Input
                  placeholder="Nombre del medicamento"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Dosis"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                />
                <Input
                  placeholder="Frecuencia"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                />
                <Input
                  placeholder="Duración"
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                />
                <Button
                  type="button"
                  onClick={addMedication}
                  disabled={!newMedication.name || !newMedication.dosage}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>
              <Input
                placeholder="Instrucciones especiales (opcional)"
                value={newMedication.instructions}
                onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Notas adicionales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas Adicionales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Observaciones adicionales, recomendaciones, próximas citas..."
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-vet-primary hover:bg-vet-primary/90"
              disabled={!formData.patientId || !formData.symptoms || !formData.diagnosis}
            >
              <Save className="h-4 w-4 mr-2" />
              Crear Historia Clínica
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}