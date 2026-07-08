import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { OwnerFormSection } from './OwnerFormSection';
import { Dueno as Owner, MascotaFormData as PatientFormData } from '@/hooks/useMascotas';

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSave: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Validación
const ownerSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'El nombre del dueño es obligatorio').max(120),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email('Email inválido').max(255).optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  emergency_contact: z.string().trim().max(120).optional().or(z.literal('')),
  relationship: z.string().trim().max(50),
  es_principal: z.boolean(),
  notes: z.string().trim().max(300).optional().or(z.literal('')),
});

const patientSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre de la mascota es obligatorio').max(120),
  especie: z.string().trim().min(1, 'La especie es obligatoria'),
  raza: z.string().trim().max(120).optional().or(z.literal('')),
  genero: z.string().trim().max(30).optional().or(z.literal('')),
  fecha_nacimiento: z.date().nullable().optional(),
  color: z.string().trim().max(60).optional().or(z.literal('')),
  microchip: z.string().trim().max(60).optional().or(z.literal('')),
  alergias: z.array(z.string()).default([]),
  condiciones_cronicas: z.array(z.string()).default([]),
  estado: z.string().trim().min(1, 'El estado es obligatorio'),
  foto_url: z.string().optional().or(z.literal('')),
  notas: z.string().optional().or(z.literal('')),
  duenos: z.array(ownerSchema).min(1, 'Debe agregar al menos un dueño'),
});

export function PatientForm({ initialData, onSave, onCancel, isLoading = false }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    nombre: initialData?.nombre || '',
    duenos: initialData?.duenos || [{
      name: '',
      phone: '',
      email: '',
      address: '',
      emergency_contact: '',
      relationship: 'propietario',
      es_principal: true,
      notes: ''
    }],
    especie: initialData?.especie || '',
    raza: initialData?.raza || '',
    genero: initialData?.genero || '',
    fecha_nacimiento: initialData?.fecha_nacimiento || null,
    color: initialData?.color || '',
    microchip: initialData?.microchip || '',
    alergias: initialData?.alergias || [],
    condiciones_cronicas: initialData?.condiciones_cronicas || [],
    estado: initialData?.estado || 'activo',
    foto_url: initialData?.foto_url || '',
    notas: initialData?.notas || '',
  });

  const { toast } = useToast();
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [dateOpen, setDateOpen] = useState(false);

  const updateField = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateOwner = (index: number, field: keyof Owner, value: any) => {
    setFormData(prev => ({
      ...prev,
      duenos: prev.duenos.map((owner, i) => 
        i === index ? { ...owner, [field]: value } : owner
      )
    }));
  };

  const addOwner = () => {
    setFormData(prev => ({
      ...prev,
      duenos: [...prev.duenos, {
        name: '',
        phone: '',
        email: '',
        address: '',
        emergency_contact: '',
        relationship: 'propietario',
        es_principal: false,
        notes: ''
      }]
    }));
  };

  const removeOwner = (index: number) => {
    if (formData.duenos.length > 1) {
      setFormData(prev => ({
        ...prev,
        duenos: prev.duenos.filter((_, i) => i !== index)
      }));
    }
  };

  const setPrimaryOwner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      duenos: prev.duenos.map((owner, i) => ({
        ...owner,
        es_principal: i === index
      }))
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.alergias.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        alergias: [...prev.alergias, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      alergias: prev.alergias.filter(a => a !== allergy)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.condiciones_cronicas.includes(newCondition.trim())) {
      setFormData(prev => ({
        ...prev,
        condiciones_cronicas: [...prev.condiciones_cronicas, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      condiciones_cronicas: prev.condiciones_cronicas.filter(c => c !== condition)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiar y validar dueños
    const cleanedOwners = formData.duenos
      .map((o) => ({ ...o, name: o.name.trim() }))
      .filter((o) => o.name.length > 0);

    if (cleanedOwners.length === 0) {
      toast({
        title: 'Faltan datos',
        description: 'Agrega al menos un dueño con nombre.',
        variant: 'destructive',
      });
      return;
    }

    // Asegurar que exista un dueño principal
    let duenos = cleanedOwners;
    if (!duenos.some((o) => o.es_principal)) {
      duenos = duenos.map((o, i) => ({ ...o, es_principal: i === 0 }));
    }

    const updatedFormData: PatientFormData = {
      ...formData,
      duenos,
    };

    try {
      patientSchema.parse(updatedFormData);
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || 'Revisa los datos del formulario';
      toast({ title: 'Validación', description: message, variant: 'destructive' });
      return;
    }

    onSave(updatedFormData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Paciente *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  placeholder="Ej: Max"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="especie">Especie *</Label>
                <Select value={formData.especie} onValueChange={(value) => updateField('especie', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perro">Perro</SelectItem>
                    <SelectItem value="gato">Gato</SelectItem>
                    <SelectItem value="ave">Ave</SelectItem>
                    <SelectItem value="reptil">Reptil</SelectItem>
                    <SelectItem value="mamifero_menor">Mamífero Menor</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raza">Raza</Label>
                <Input
                  id="raza"
                  value={formData.raza}
                  onChange={(e) => updateField('raza', e.target.value)}
                  placeholder="Ej: Labrador"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select value={formData.genero} onValueChange={(value) => updateField('genero', value)}>
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
                <Label>Fecha de Nacimiento</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.fecha_nacimiento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.fecha_nacimiento ? (
                        format(formData.fecha_nacimiento, "PPP")
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.fecha_nacimiento || undefined}
                      onSelect={(date) => {
                        updateField('fecha_nacimiento', date || null);
                        setDateOpen(false);
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  placeholder="Ej: Marrón"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="microchip">Microchip</Label>
                <Input
                  id="microchip"
                  value={formData.microchip}
                  onChange={(e) => updateField('microchip', e.target.value)}
                  placeholder="Número de microchip"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => updateField('estado', value)}>
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
            </div>
          </div>

          {/* Sección de Dueños */}
          <OwnerFormSection
            owners={formData.duenos}
            onAddOwner={addOwner}
            onRemoveOwner={removeOwner}
            onUpdateOwner={updateOwner}
            onSetPrimary={setPrimaryOwner}
          />

          {/* Información Médica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Información Médica</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergy">Alergias</Label>
                <div className="flex gap-2">
                  <Input
                    id="allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Agregar alergia"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAllergy();
                      }
                    }}
                  />
                  <Button type="button" onClick={addAllergy} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.alergias.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.alergias.map((allergy, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {allergy}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeAllergy(allergy)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condiciones Crónicas</Label>
                <div className="flex gap-2">
                  <Input
                    id="condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Agregar condición"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCondition();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCondition} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.condiciones_cronicas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.condiciones_cronicas.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {condition}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeCondition(condition)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary/90"
            >
              {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Paciente'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
