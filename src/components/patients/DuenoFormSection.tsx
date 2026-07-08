import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, UserPlus } from 'lucide-react';
import { Dueno } from '@/hooks/useMascotas';
import { Owner } from '@/hooks/useOwners';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';

interface DuenoFormSectionProps {
  duenos: Dueno[];
  existingOwners: Owner[];
  onAddDueno: () => void;
  onRemoveDueno: (index: number) => void;
  onUpdateDueno: (index: number, field: keyof Dueno, value: any) => void;
  onSetPrincipal: (index: number) => void;
  onAddDuenoWithData?: (dueno: Dueno) => void;
}

export function DuenoFormSection({
  duenos,
  existingOwners,
  onAddDueno,
  onRemoveDueno,
  onUpdateDueno,
  onSetPrincipal,
  onAddDuenoWithData,
}: DuenoFormSectionProps) {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');

  const handleSelectExistingOwner = (ownerId: string) => {
    if (!ownerId || ownerId === 'new') {
      setSelectedOwnerId('');
      return;
    }

    const selectedOwner = existingOwners.find(o => o.id === ownerId);
    if (!selectedOwner) return;

    // Verificar si el dueño ya está agregado
    const alreadyExists = duenos.some(d => 
      d.name === selectedOwner.name && d.phone === selectedOwner.phone
    );

    if (alreadyExists) {
      setSelectedOwnerId('');
      return;
    }

    // Crear el nuevo dueño
    const newDueno: Dueno = {
      id: selectedOwner.id,
      name: selectedOwner.name,
      phone: selectedOwner.phone || '',
      email: selectedOwner.email || '',
      address: selectedOwner.address || '',
      emergency_contact: selectedOwner.emergency_contact || '',
      relationship: selectedOwner.relationship || 'propietario',
      notes: selectedOwner.notes || '',
      es_principal: false, // Se determina en handleAddDuenoWithData
    };

    // Usar la función de inserción directa
    if (onAddDuenoWithData) {
      onAddDuenoWithData(newDueno);
    }

    setSelectedOwnerId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">Dueños o Responsables</h3>
          <Button type="button" onClick={onAddDueno} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Crear Nuevo Dueño
          </Button>
        </div>

        {/* Selector de dueños existentes con búsqueda */}
        <div className="space-y-2">
          <Label htmlFor="existing-owner">O selecciona un dueño existente</Label>
          <div className="flex gap-2">
            <Combobox
              options={[
                { value: 'new', label: '-- Crear nuevo --' },
                ...existingOwners.map(owner => ({
                  value: owner.id,
                  label: `${owner.name}${owner.phone ? ` (${owner.phone})` : ''}`
                }))
              ]}
              value={selectedOwnerId}
              onValueChange={handleSelectExistingOwner}
              placeholder="Buscar dueño existente..."
              searchPlaceholder="Buscar por nombre o teléfono..."
              emptyMessage="No se encontró ningún dueño"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {duenos.map((dueno, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium">Dueño {index + 1}</h4>
              {dueno.es_principal && (
                <Badge variant="default">Principal</Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {!dueno.es_principal && (
                <Button
                  type="button"
                  onClick={() => onSetPrincipal(index)}
                  size="sm"
                  variant="outline"
                >
                  Hacer Principal
                </Button>
              )}
              {duenos.length > 1 && (
                <Button
                  type="button"
                  onClick={() => onRemoveDueno(index)}
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
              <Label htmlFor={`dueno_name_${index}`}>Nombre *</Label>
              <Input
                id={`dueno_name_${index}`}
                value={dueno.name}
                onChange={(e) => onUpdateDueno(index, 'name', e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dueno_phone_${index}`}>Teléfono</Label>
              <Input
                id={`dueno_phone_${index}`}
                type="tel"
                value={dueno.phone}
                onChange={(e) => onUpdateDueno(index, 'phone', e.target.value)}
                placeholder="Ej: +593 99 123 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dueno_email_${index}`}>Email</Label>
              <Input
                id={`dueno_email_${index}`}
                type="email"
                value={dueno.email}
                onChange={(e) => onUpdateDueno(index, 'email', e.target.value)}
                placeholder="Ej: juan@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dueno_relationship_${index}`}>Relación</Label>
              <Select
                value={dueno.relationship}
                onValueChange={(value) => onUpdateDueno(index, 'relationship', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar relación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propietario">Dueño</SelectItem>
                  <SelectItem value="cuidador">Cuidador</SelectItem>
                  <SelectItem value="familiar">Familiar</SelectItem>
                  <SelectItem value="veterinario">Veterinario</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`dueno_address_${index}`}>Dirección</Label>
              <Textarea
                id={`dueno_address_${index}`}
                value={dueno.address}
                onChange={(e) => onUpdateDueno(index, 'address', e.target.value)}
                placeholder="Dirección completa"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dueno_emergency_${index}`}>Contacto de Emergencia</Label>
              <Input
                id={`dueno_emergency_${index}`}
                value={dueno.emergency_contact}
                onChange={(e) => onUpdateDueno(index, 'emergency_contact', e.target.value)}
                placeholder="Nombre y teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dueno_notes_${index}`}>Notas</Label>
              <Input
                id={`dueno_notes_${index}`}
                value={dueno.notes}
                onChange={(e) => onUpdateDueno(index, 'notes', e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
