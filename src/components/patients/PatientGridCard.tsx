import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, 
  Calendar, 
  MessageSquare, 
  FileText,
  Heart,
  Dog,
  Cat,
  Bird
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PatientOwners } from './PatientOwners';

interface Owner {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  relationship: string;
  is_primary: boolean;
  notes: string;
}

interface Patient {
  id: string;
  name: string;
  owner_name: string;
  owners?: Owner[]; // Nueva propiedad para múltiples dueños
  species: string;
  breed?: string;
  birth_date?: Date;
  status: 'activo' | 'inactivo' | 'fallecido';
  created_at: Date;
  phone?: string;
  email?: string;
  last_visit?: Date;
  gender?: string;
  color?: string;
  microchip?: string;
  address?: string;
  emergency_contact?: string;
  allergies?: string[];
  chronic_conditions?: string[];
}

interface PatientGridCardProps {
  patient: Patient;
  onViewHistory: (patient: Patient) => void;
  onWhatsApp: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
}

export function PatientGridCard({ 
  patient, 
  onViewHistory, 
  onWhatsApp, 
  onEdit 
}: PatientGridCardProps) {
  
  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'perro':
      case 'dog':
        return Dog;
      case 'gato':
      case 'cat':
        return Cat;
      case 'ave':
      case 'bird':
        return Bird;
      default:
        return Heart;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'activo':
        return { label: 'En tratamiento', color: 'bg-orange-100 text-orange-800' };
      case 'inactivo':
        return { label: 'Seguimiento', color: 'bg-blue-100 text-blue-800' };
      case 'fallecido':
        return { label: 'Fallecido', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: 'Activo', color: 'bg-green-100 text-green-800' };
    }
  };

  const getPrimaryCondition = () => {
    if (patient.chronic_conditions && patient.chronic_conditions.length > 0) {
      return patient.chronic_conditions[0];
    }
    if (patient.allergies && patient.allergies.length > 0) {
      return `Alergia: ${patient.allergies[0]}`;
    }
    return 'Consulta general';
  };

  const getNextAppointment = () => {
    if (patient.last_visit) {
      // Simulate next appointment (this could come from appointments table)
      const nextDate = new Date(patient.last_visit);
      nextDate.setDate(nextDate.getDate() + 30);
      return nextDate;
    }
    return null;
  };

  const SpeciesIcon = getSpeciesIcon(patient.species);
  const statusInfo = getStatusInfo(patient.status);
  const nextAppointment = getNextAppointment();

  return (
    <Card className="bg-white border-0 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 min-w-0">
      <CardContent className="p-6">
        {/* Header with pet info and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-12 w-12 bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
              <AvatarFallback className="bg-transparent">
                <SpeciesIcon className="h-6 w-6 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-foreground truncate">{patient.name}</h3>
              <div className="text-sm">
                <PatientOwners 
                  owners={patient.owners}
                  owner_name={patient.owner_name}
                  phone={patient.phone}
                  email={patient.email}
                  address={patient.address}
                  emergency_contact={patient.emergency_contact}
                  compact={true}
                />
              </div>
            </div>
          </div>
          <Badge className={`${statusInfo.color} border-0 font-medium flex-shrink-0 ml-2`}>
            {statusInfo.label}
          </Badge>
        </div>

        {/* Medical condition */}
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-foreground font-medium truncate">{getPrimaryCondition()}</p>
        </div>

        {/* Contact info - Remove phone display since it's now in PatientOwners */}
        {/* Medical condition */}
        {nextAppointment && (
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground truncate">
              Próxima: {format(nextAppointment, 'yyyy-MM-dd', { locale: es })}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onViewHistory(patient)}
            className="bg-gradient-to-r from-primary/90 to-primary text-white hover:from-primary hover:to-primary/90 shadow-lg shadow-primary/25"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ver Historia
          </Button>
          <Button
            onClick={() => onWhatsApp(patient)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        {/* Edit button for admin actions (optional) */}
        {onEdit && (
          <Button
            onClick={() => onEdit(patient)}
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-muted-foreground hover:text-foreground"
          >
            Editar información
          </Button>
        )}
      </CardContent>
    </Card>
  );
}