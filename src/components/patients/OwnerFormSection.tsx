import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Dueno as Owner } from '@/hooks/useMascotas';

interface OwnerFormSectionProps {
  owners: Owner[];
  onAddOwner: () => void;
  onRemoveOwner: (index: number) => void;
  onUpdateOwner: (index: number, field: keyof Owner, value: any) => void;
  onSetPrimary: (index: number) => void;
}

export function OwnerFormSection({
  owners,
  onAddOwner,
  onRemoveOwner,
  onUpdateOwner,
  onSetPrimary,
}: OwnerFormSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Dueños o Responsables</h3>
        <Button type="button" onClick={onAddOwner} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Dueño
        </Button>
      </div>

      {owners.map((owner, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium">Dueño {index + 1}</h4>
              {owner.es_principal && (
                <Badge variant="default">Principal</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {!owner.es_principal && (
                <Button
                  type="button"
                  onClick={() => onSetPrimary(index)}
                  size="sm"
                  variant="outline"
                >
                  Hacer Principal
                </Button>
              )}
              {owners.length > 1 && (
                <Button
                  type="button"
                  onClick={() => onRemoveOwner(index)}
                  size="sm"
                  variant="destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`owner_name_${index}`}>Nombre *</Label>
              <Input
                id={`owner_name_${index}`}
                value={owner.name}
                onChange={(e) => onUpdateOwner(index, 'name', e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`owner_phone_${index}`}>Teléfono</Label>
              <Input
                id={`owner_phone_${index}`}
                type="tel"
                value={owner.phone}
                onChange={(e) => onUpdateOwner(index, 'phone', e.target.value)}
                placeholder="Ej: +593 99 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`owner_email_${index}`}>Email</Label>
              <Input
                id={`owner_email_${index}`}
                type="email"
                value={owner.email}
                onChange={(e) => onUpdateOwner(index, 'email', e.target.value)}
                placeholder="Ej: juan@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`owner_relationship_${index}`}>Relación</Label>
              <Select
                value={owner.relationship}
                onValueChange={(value) => onUpdateOwner(index, 'relationship', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar relación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propietario">Propietario</SelectItem>
                  <SelectItem value="cuidador">Cuidador</SelectItem>
                  <SelectItem value="familiar">Familiar</SelectItem>
                  <SelectItem value="veterinario">Veterinario</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`owner_address_${index}`}>Dirección</Label>
              <Textarea
                id={`owner_address_${index}`}
                value={owner.address}
                onChange={(e) => onUpdateOwner(index, 'address', e.target.value)}
                placeholder="Dirección completa"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`owner_emergency_${index}`}>Contacto de Emergencia</Label>
              <Input
                id={`owner_emergency_${index}`}
                value={owner.emergency_contact}
                onChange={(e) => onUpdateOwner(index, 'emergency_contact', e.target.value)}
                placeholder="Nombre y teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`owner_notes_${index}`}>Notas</Label>
              <Input
                id={`owner_notes_${index}`}
                value={owner.notes}
                onChange={(e) => onUpdateOwner(index, 'notes', e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
