import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

const medicalRecordSchema = z.object({
  type: z.string().min(1, 'El tipo es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  weight: z.string().optional(),
  temperature: z.string().optional(),
  heart_rate: z.string().optional(),
  respiratory_rate: z.string().optional(),
  medications: z.array(z.string()).default([]),
  priority: z.enum(['baja', 'media', 'alta']).default('media'),
  status: z.enum(['activo', 'completado', 'cancelado']).default('activo'),
  veterinarian: z.string().min(1, 'El veterinario es requerido'),
  next_appointment: z.string().optional(),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordFormProps {
  patientId: string;
  onSubmit: (data: MedicalRecordFormData) => void;
  onCancel: () => void;
  initialData?: Partial<MedicalRecordFormData>;
  isLoading?: boolean;
}

export function MedicalRecordForm({ 
  patientId, 
  onSubmit, 
  onCancel, 
  initialData,
  isLoading = false 
}: MedicalRecordFormProps) {
  const [medications, setMedications] = React.useState<string[]>(initialData?.medications || []);
  const [newMedication, setNewMedication] = React.useState('');

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      type: '',
      date: new Date().toISOString().split('T')[0],
      symptoms: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      weight: '',
      temperature: '',
      heart_rate: '',
      respiratory_rate: '',
      medications: [],
      priority: 'media',
      status: 'activo',
      veterinarian: '',
      next_appointment: '',
      ...initialData,
    },
  });

  const addMedication = () => {
    if (newMedication.trim()) {
      const updatedMedications = [...medications, newMedication.trim()];
      setMedications(updatedMedications);
      form.setValue('medications', updatedMedications);
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
    form.setValue('medications', updatedMedications);
  };

  const handleSubmit = (data: MedicalRecordFormData) => {
    onSubmit({ ...data, medications });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Historia Médica' : 'Nueva Historia Médica'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Consulta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consultas generales">Consultas Generales</SelectItem>
                        <SelectItem value="control de pulgas/garrapatas">Control de Pulgas/Garrapatas</SelectItem>
                        <SelectItem value="alergias">Alergias</SelectItem>
                        <SelectItem value="urgencias">Urgencias</SelectItem>
                        <SelectItem value="Cytopoint">Cytopoint</SelectItem>
                        <SelectItem value="piel y pelos">Piel y Pelos</SelectItem>
                        <SelectItem value="otra">Otra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="veterinarian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veterinario</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del veterinario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heart_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freq. Cardíaca</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="bpm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="respiratory_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Freq. Respiratoria</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="rpm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Síntomas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe los síntomas observados..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Diagnóstico médico..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tratamiento</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Plan de tratamiento..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Medicamentos</FormLabel>
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar medicamento..."
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                  />
                  <Button type="button" onClick={addMedication} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {medications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {medications.map((med, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {med}
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observaciones adicionales..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="next_appointment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima Cita (opcional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Guardar')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}