import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-xs text-gray-500 ml-2">
              vs mes anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    owner: string;
    lastVisit: string;
    status: 'healthy' | 'treatment' | 'critical';
    avatar?: string;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

export function PatientCard({ patient, onView, onEdit, className }: PatientCardProps) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    treatment: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    healthy: 'Saludable',
    treatment: 'En tratamiento',
    critical: 'Crítico'
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {patient.avatar ? (
                <img 
                  src={patient.avatar} 
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold text-lg">
                  {patient.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              <CardDescription>
                {patient.species} • {patient.breed} • {patient.age}
              </CardDescription>
            </div>
          </div>
          <Badge className={cn("text-xs", statusColors[patient.status])}>
            {statusLabels[patient.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Propietario:</span>
            <span className="font-medium">{patient.owner}</span>
          </div>
          <div className="flex justify-between">
            <span>Última visita:</span>
            <span className="font-medium">{patient.lastVisit}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="flex space-x-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(patient.id)}
          >
            Ver Historial
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit?.(patient.id)}
          >
            Editar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

interface AppointmentCardProps {
  appointment: {
    id: string;
    patientName: string;
    ownerName: string;
    time: string;
    type: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    notes?: string;
  };
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
}

export function AppointmentCard({ appointment, onStart, onComplete, onCancel, className }: AppointmentCardProps) {
  // Add safety check for appointment prop
  if (!appointment) {
    return null;
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    scheduled: 'Programada',
    'in-progress': 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada'
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{appointment.patientName}</CardTitle>
            <CardDescription>
              {appointment.ownerName} • {appointment.time}
            </CardDescription>
          </div>
          <Badge className={cn("text-xs", statusColors[appointment.status])}>
            {statusLabels[appointment.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tipo:</span>
            <span className="font-medium">{appointment.type}</span>
          </div>
          {appointment.notes && (
            <div className="text-sm">
              <span className="text-gray-600">Notas:</span>
              <p className="text-gray-900 mt-1">{appointment.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t">
        <div className="flex space-x-2 w-full">
          {appointment.status === 'scheduled' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onCancel?.(appointment.id)}
              >
                Cancelar
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onStart?.(appointment.id)}
              >
                Iniciar
              </Button>
            </>
          )}
          {appointment.status === 'in-progress' && (
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => onComplete?.(appointment.id)}
            >
              Completar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}