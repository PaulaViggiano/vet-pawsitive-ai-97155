import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DuenoFormSection } from './DuenoFormSection';
import { Mascota, MascotaFormData, Dueno } from '@/hooks/useMascotas';
import { useOwners } from '@/hooks/useOwners';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const duenoSchema = z.object({
  name: z.string().min(1, 'El nombre del dueño es requerido'),
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  emergency_contact: z.string(),
  relationship: z.string(),
  notes: z.string(),
  es_principal: z.boolean(),
});

const mascotaSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la mascota es requerido'),
  especie: z.string().min(1, 'La especie es requerida'),
  raza: z.string(),
  fecha_nacimiento: z.date().nullable(),
  color: z.string(),
  microchip: z.string(),
  genero: z.string(),
  alergias: z.array(z.string()),
  condiciones_cronicas: z.array(z.string()),
  estado: z.string(),
  foto_url: z.string(),
  notas: z.string(),
  duenos: z.array(duenoSchema).min(1, 'Debe agregar al menos un dueño'),
});

interface MascotaFormProps {
  initialData?: Mascota;
  onSave: (data: MascotaFormData) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MascotaForm({ initialData, onSave, onCancel, isLoading }: MascotaFormProps) {
  const { toast } = useToast();
  const { owners } = useOwners();
  const [formData, setFormData] = useState<MascotaFormData>({
    nombre: initialData?.nombre || '',
    especie: initialData?.especie || '',
    raza: initialData?.raza || '',
    fecha_nacimiento: initialData?.fecha_nacimiento || null,
    color: initialData?.color || '',
    microchip: initialData?.microchip || '',
    genero: initialData?.genero || '',
    alergias: initialData?.alergias || [],
    condiciones_cronicas: initialData?.condiciones_cronicas || [],
    estado: initialData?.estado || 'activo',
    foto_url: initialData?.foto_url || '',
    notas: initialData?.notas || '',
    duenos: initialData?.duenos || [{
      name: '',
      phone: '',
      email: '',
      address: '',
      emergency_contact: '',
      relationship: 'propietario',
      notes: '',
      es_principal: true,
    }],
  });

  const handleAddDueno = () => {
    setFormData({
      ...formData,
      duenos: [
        ...formData.duenos,
        {
          name: '',
          phone: '',
          email: '',
          address: '',
          emergency_contact: '',
          relationship: 'propietario',
          notes: '',
          es_principal: formData.duenos.length === 0, // Si es el primero, hacerlo principal
        },
      ],
    });
  };

  const handleAddDuenoWithData = (dueno: Dueno) => {
    setFormData((prev) => {
      let updated = [...prev.duenos];
      
      // Si solo hay un dueño y está vacío, reemplazarlo
      const hasOnlyEmptyOwner = updated.length === 1 && !updated[0].name.trim();
      
      if (hasOnlyEmptyOwner) {
        // Reemplazar el dueño vacío con el nuevo
        return { 
          ...prev, 
          duenos: [{ ...dueno, es_principal: true }] 
        };
      }
      
      // Si hay múltiples dueños o el único no está vacío, agregar normalmente
      const hasPrincipal = updated.some((d) => d.es_principal);
      const duenoToAdd = { ...dueno };

      if (!hasPrincipal) {
        duenoToAdd.es_principal = true;
      } else if (dueno.es_principal) {
        updated = updated.map((d) => ({ ...d, es_principal: false }));
      }

      updated.push(duenoToAdd);
      return { ...prev, duenos: updated };
    });
  };
  const handleRemoveDueno = (index: number) => {
    const newDuenos = formData.duenos.filter((_, i) => i !== index);
    if (newDuenos.length > 0 && !newDuenos.some(d => d.es_principal)) {
      newDuenos[0].es_principal = true;
    }
    setFormData({ ...formData, duenos: newDuenos });
  };

  const handleUpdateDueno = (index: number, field: keyof Dueno, value: any) => {
    const newDuenos = [...formData.duenos];
    newDuenos[index] = { ...newDuenos[index], [field]: value };
    setFormData({ ...formData, duenos: newDuenos });
  };

  const handleSetPrincipal = (index: number) => {
    const newDuenos = formData.duenos.map((dueno, i) => ({
      ...dueno,
      es_principal: i === index,
    }));
    setFormData({ ...formData, duenos: newDuenos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar que hay al menos un dueño con nombre
      const validDuenos = formData.duenos.filter(d => d.name.trim());
      
      if (validDuenos.length === 0) {
        toast({
          title: 'Error de validación',
          description: 'Debe agregar al menos un dueño con nombre',
          variant: 'destructive',
        });
        return;
      }

      // Asegurar que hay un dueño principal
      if (!validDuenos.some(d => d.es_principal)) {
        validDuenos[0].es_principal = true;
      }

      // Validar campos requeridos
      if (!formData.nombre.trim()) {
        toast({
          title: 'Error de validación',
          description: 'El nombre de la mascota es requerido',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.especie) {
        toast({
          title: 'Error de validación',
          description: 'La especie es requerida',
          variant: 'destructive',
        });
        return;
      }

      const updatedFormData = {
        ...formData,
        duenos: validDuenos,
      };

      // Intentar guardar
      const success = await onSave(updatedFormData);
      
      if (!success) {
        toast({
          title: 'Error',
          description: 'No se pudo guardar la mascota. Por favor intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar la mascota',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Información de la Mascota</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre de la mascota"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="especie">Especie *</Label>
            <Select
              value={formData.especie}
              onValueChange={(value) => setFormData({ ...formData, especie: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perro">Perro</SelectItem>
                <SelectItem value="gato">Gato</SelectItem>
                <SelectItem value="ave">Ave</SelectItem>
                <SelectItem value="conejo">Conejo</SelectItem>
                <SelectItem value="hamster">Hámster</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raza">Raza</Label>
            <Input
              id="raza"
              value={formData.raza}
              onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              placeholder="Raza"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Género</Label>
            <Select
              value={formData.genero}
              onValueChange={(value) => setFormData({ ...formData, genero: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macho">Macho</SelectItem>
                <SelectItem value="hembra">Hembra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento ? formData.fecha_nacimiento.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value ? new Date(e.target.value) : null })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Color"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="microchip">Microchip</Label>
            <Input
              id="microchip"
              value={formData.microchip}
              onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
              placeholder="Número de microchip"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData({ ...formData, estado: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="fallecido">Fallecido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales sobre la mascota"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Dueños */}
      <DuenoFormSection
        duenos={formData.duenos}
        existingOwners={owners}
        onAddDueno={handleAddDueno}
        onRemoveDueno={handleRemoveDueno}
        onUpdateDueno={handleUpdateDueno}
        onSetPrincipal={handleSetPrincipal}
        onAddDuenoWithData={handleAddDuenoWithData}
      />

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
