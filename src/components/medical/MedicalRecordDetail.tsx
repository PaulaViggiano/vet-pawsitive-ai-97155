import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  User, 
  Stethoscope,
  Thermometer,
  Heart,
  Wind,
  Weight,
  Pill,
  AlertCircle,
  Edit,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MedicalRecord } from './MedicalRecordList';

interface MedicalRecordDetailProps {
  record: MedicalRecord;
  onEdit: () => void;
  onClose: () => void;
}

export function MedicalRecordDetail({ record, onEdit, onClose }: MedicalRecordDetailProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baja': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'default';
      case 'completado': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl capitalize flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {record.type}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(record.priority)}>
                {record.priority}
              </Badge>
              <Badge variant={getStatusColor(record.status)}>
                {record.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Fecha:</span>
                <span>{format(new Date(record.date), 'PPPp', { locale: es })}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Veterinario:</span>
                <span>{record.veterinarian}</span>
              </div>

              {record.patient && (
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Paciente:</span>
                  <span>{record.patient.name} ({record.patient.species})</span>
                </div>
              )}

              {record.patient?.owner_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Propietario:</span>
                  <span>{record.patient.owner_name}</span>
                </div>
              )}
            </div>

            {/* Signos vitales */}
            {(record.weight || record.temperature || record.heart_rate || record.respiratory_rate) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Signos Vitales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {record.weight && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Peso</span>
                      </div>
                      <span className="font-medium">{record.weight} kg</span>
                    </div>
                  )}
                  
                  {record.temperature && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Temperatura</span>
                      </div>
                      <span className="font-medium">{record.temperature}°C</span>
                    </div>
                  )}
                  
                  {record.heart_rate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Freq. Cardíaca</span>
                      </div>
                      <span className="font-medium">{record.heart_rate} bpm</span>
                    </div>
                  )}
                  
                  {record.respiratory_rate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Freq. Respiratoria</span>
                      </div>
                      <span className="font-medium">{record.respiratory_rate} rpm</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Información clínica */}
          <div className="space-y-6">
            {record.symptoms && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Síntomas
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {record.symptoms}
                </p>
              </div>
            )}

            {record.diagnosis && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Diagnóstico
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {record.diagnosis}
                </p>
              </div>
            )}

            {record.treatment && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tratamiento
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {record.treatment}
                </p>
              </div>
            )}

            {record.medications.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medicamentos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {record.medications.map((medication, index) => (
                    <Badge key={index} variant="outline">
                      {medication}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {record.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notas Adicionales</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {record.notes}
                </p>
              </div>
            )}

            {record.next_appointment && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próxima Cita
                </h3>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    {format(new Date(record.next_appointment), 'PPPp', { locale: es })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Información de registro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Creado:</span> {format(new Date(record.created_at), 'PPp', { locale: es })}
            </div>
            <div>
              <span className="font-medium">Actualizado:</span> {format(new Date(record.updated_at), 'PPp', { locale: es })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}