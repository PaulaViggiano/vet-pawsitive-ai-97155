import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, User } from 'lucide-react';

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

interface PatientOwnersProps {
  owners?: Owner[];
  owner_name?: string; // Para compatibilidad con datos existentes
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  compact?: boolean; // Para mostrar versión compacta
}

export function PatientOwners({ 
  owners, 
  owner_name, 
  phone, 
  email, 
  address, 
  emergency_contact,
  compact = false 
}: PatientOwnersProps) {
  // Si no hay owners array, crear uno con los datos legacy
  const displayOwners = owners && owners.length > 0 ? owners : [{
    name: owner_name || '',
    phone: phone || '',
    email: email || '',
    address: address || '',
    emergency_contact: emergency_contact || '',
    relationship: 'propietario',
    is_primary: true,
    notes: ''
  }];

  // Filtrar owners vacíos
  const validOwners = displayOwners.filter(owner => owner.name.trim() !== '');

  if (validOwners.length === 0) {
    return <span className="text-muted-foreground">Sin información de propietario</span>;
  }

  // Versión compacta para tarjetas y listas
  if (compact) {
    const primaryOwner = validOwners.find(owner => owner.is_primary) || validOwners[0];
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{primaryOwner.name}</span>
          {primaryOwner.is_primary && validOwners.length > 1 && (
            <Badge variant="secondary" className="text-xs">Principal</Badge>
          )}
        </div>
        {primaryOwner.phone && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{primaryOwner.phone}</span>
          </div>
        )}
        {validOwners.length > 1 && (
          <div className="text-xs text-muted-foreground">
            +{validOwners.length - 1} propietario{validOwners.length > 2 ? 's' : ''} más
          </div>
        )}
      </div>
    );
  }

  // Versión completa para detalles
  return (
    <div className="space-y-4">
      {validOwners.map((owner, index) => (
        <Card key={index} className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{owner.name}</span>
              </div>
              <div className="flex gap-2">
                {owner.is_primary && (
                  <Badge variant="default" className="text-xs">Principal</Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {owner.relationship}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {owner.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{owner.phone}</span>
                </div>
              )}
              
              {owner.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{owner.email}</span>
                </div>
              )}
              
              {owner.address && (
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{owner.address}</span>
                </div>
              )}
              
              {owner.emergency_contact && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Contacto de emergencia: </span>
                  <span className="font-medium">{owner.emergency_contact}</span>
                </div>
              )}
              
              {owner.notes && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Notas: </span>
                  <span>{owner.notes}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}