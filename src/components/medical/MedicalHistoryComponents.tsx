import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  FileText, 
  Stethoscope, 
  Heart, 
  Thermometer,
  Weight,
  Activity,
  Pill,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Types
interface MedicalRecord {
  id: string;
  patient_id: string;
  date: string;
  type: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medications: string[];
  weight?: number;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  notes?: string;
  veterinarian: string;
  priority: 'baja' | 'media' | 'alta';
  status: 'activo' | 'completado' | 'cancelado';
  attachments?: string[];
  next_appointment?: string;
}

interface Vaccine {
  id: string;
  patient_id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date?: string;
  batch_number?: string;
  veterinarian: string;
  notes?: string;
}

interface Surgery {
  id: string;
  patient_id: string;
  surgery_name: string;
  date: string;
  duration?: number;
  anesthesia_used?: string;
  complications?: string;
  post_op_notes?: string;
  veterinarian: string;
  surgeon?: string;
  status: 'programada' | 'en_curso' | 'completada' | 'cancelada';
}

// Medical Timeline Component
export function MedicalTimeline({ records }: { records: MedicalRecord[] }) {
  const sortedRecords = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consulta': return <Stethoscope className="h-4 w-4" />;
      case 'vacunacion': return <Heart className="h-4 w-4" />;
      case 'cirugia': return <Activity className="h-4 w-4" />;
      case 'emergencia': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Línea de Tiempo Médica
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
        
        {sortedRecords.map((record, index) => (
          <div key={record.id} className="relative flex items-start gap-6 pb-8">
            {/* Timeline dot */}
            <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${getPriorityColor(record.priority)} text-white shadow-lg`}>
              {getTypeIcon(record.type)}
            </div>
            
            {/* Content */}
            <Card className="flex-1 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold capitalize">{record.type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(record.date), 'PPP', { locale: es })} • Dr. {record.veterinarian}
                    </p>
                  </div>
                  <Badge variant={record.status === 'completado' ? 'secondary' : 'default'}>
                    {record.status}
                  </Badge>
                </div>
                
                {record.diagnosis && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Diagnóstico: </span>
                    <span className="text-sm">{record.diagnosis}</span>
                  </div>
                )}
                
                {record.treatment && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Tratamiento: </span>
                    <span className="text-sm">{record.treatment}</span>
                  </div>
                )}
                
                {record.medications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {record.medications.map((med, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {med}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

// Vital Signs Chart Component
export function VitalSignsChart({ records }: { records: MedicalRecord[] }) {
  const recordsWithVitals = records.filter(r => r.weight || r.temperature || r.heart_rate || r.respiratory_rate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Signos Vitales
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recordsWithVitals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay registros de signos vitales</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recordsWithVitals.map((record) => (
              <div key={record.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">
                    {format(new Date(record.date), 'PP', { locale: es })}
                  </span>
                  <Badge variant="outline">{record.type}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {record.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{record.weight} kg</span>
                    </div>
                  )}
                  {record.temperature && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{record.temperature}°C</span>
                    </div>
                  )}
                  {record.heart_rate && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{record.heart_rate} bpm</span>
                    </div>
                  )}
                  {record.respiratory_rate && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{record.respiratory_rate} rpm</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Vaccination Schedule Component
export function VaccinationSchedule({ vaccines }: { vaccines: Vaccine[] }) {
  const upcomingVaccines = vaccines.filter(v => {
    if (!v.next_due_date) return false;
    const dueDate = new Date(v.next_due_date);
    const now = new Date();
    return dueDate > now;
  });

  const overdueVaccines = vaccines.filter(v => {
    if (!v.next_due_date) return false;
    const dueDate = new Date(v.next_due_date);
    const now = new Date();
    return dueDate < now;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Calendario de Vacunación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue vaccines */}
        {overdueVaccines.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 mb-2">Vacunas Vencidas</h4>
            {overdueVaccines.map((vaccine) => (
              <div key={vaccine.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{vaccine.vaccine_name}</span>
                    <p className="text-sm text-muted-foreground">
                      Vencía: {format(new Date(vaccine.next_due_date!), 'PP', { locale: es })}
                    </p>
                  </div>
                  <Badge variant="destructive">Vencida</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming vaccines */}
        {upcomingVaccines.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-600 mb-2">Próximas Vacunas</h4>
            {upcomingVaccines.map((vaccine) => (
              <div key={vaccine.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{vaccine.vaccine_name}</span>
                    <p className="text-sm text-muted-foreground">
                      Próxima: {format(new Date(vaccine.next_due_date!), 'PP', { locale: es })}
                    </p>
                  </div>
                  <Badge variant="outline">Programada</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All vaccines history */}
        <div>
          <h4 className="font-medium mb-2">Historial Completo</h4>
          {vaccines.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay vacunas registradas</p>
          ) : (
            <div className="space-y-2">
              {vaccines.map((vaccine) => (
                <div key={vaccine.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{vaccine.vaccine_name}</span>
                      <p className="text-sm text-muted-foreground">
                        Aplicada: {format(new Date(vaccine.date_administered), 'PP', { locale: es })}
                        {vaccine.batch_number && ` • Lote: ${vaccine.batch_number}`}
                      </p>
                    </div>
                    <Badge variant="secondary">Aplicada</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Surgery History Component
export function SurgeryHistory({ surgeries }: { surgeries: Surgery[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Historial Quirúrgico
        </CardTitle>
      </CardHeader>
      <CardContent>
        {surgeries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay cirugías registradas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {surgeries.map((surgery) => (
              <Card key={surgery.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{surgery.surgery_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(surgery.date), 'PPP', { locale: es })}
                      </p>
                    </div>
                    <Badge variant={surgery.status === 'completada' ? 'secondary' : 'default'}>
                      {surgery.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Veterinario: </span>
                      <span>{surgery.veterinarian}</span>
                    </div>
                    {surgery.surgeon && (
                      <div>
                        <span className="font-medium">Cirujano: </span>
                        <span>{surgery.surgeon}</span>
                      </div>
                    )}
                    {surgery.duration && (
                      <div>
                        <span className="font-medium">Duración: </span>
                        <span>{surgery.duration} min</span>
                      </div>
                    )}
                    {surgery.anesthesia_used && (
                      <div>
                        <span className="font-medium">Anestesia: </span>
                        <span>{surgery.anesthesia_used}</span>
                      </div>
                    )}
                  </div>
                  
                  {surgery.post_op_notes && (
                    <div className="mt-3 p-3 bg-muted/50 rounded">
                      <span className="font-medium text-sm">Notas post-operatorias: </span>
                      <p className="text-sm mt-1">{surgery.post_op_notes}</p>
                    </div>
                  )}
                  
                  {surgery.complications && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <span className="font-medium text-sm text-red-800">Complicaciones: </span>
                      <p className="text-sm mt-1 text-red-700">{surgery.complications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Medical Summary Component
export function MedicalSummary({ 
  records, 
  vaccines, 
  surgeries 
}: { 
  records: MedicalRecord[]; 
  vaccines: Vaccine[]; 
  surgeries: Surgery[]; 
}) {
  const recentRecords = records.slice(0, 3);
  const activeConditions = records
    .filter(r => r.status === 'activo' && r.diagnosis)
    .map(r => r.diagnosis)
    .filter(Boolean);
  
  const currentMedications = records
    .filter(r => r.status === 'activo' && r.medications.length > 0)
    .flatMap(r => r.medications);
  
  const uniqueMedications = [...new Set(currentMedications)];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Recent visits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Consultas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentRecords.length}</div>
          <p className="text-xs text-muted-foreground">En los últimos 30 días</p>
        </CardContent>
      </Card>

      {/* Active conditions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Condiciones Activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeConditions.length}</div>
          <p className="text-xs text-muted-foreground">Diagnósticos en tratamiento</p>
        </CardContent>
      </Card>

      {/* Current medications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Medicamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueMedications.length}</div>
          <p className="text-xs text-muted-foreground">En tratamiento actual</p>
        </CardContent>
      </Card>

      {/* Surgeries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Cirugías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{surgeries.length}</div>
          <p className="text-xs text-muted-foreground">Procedimientos realizados</p>
        </CardContent>
      </Card>
    </div>
  );
}