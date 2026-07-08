import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Dueno {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  relationship: string;
  notes: string;
  es_principal: boolean;
}

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza?: string;
  fecha_nacimiento?: Date;
  color?: string;
  microchip?: string;
  genero?: string;
  alergias?: string[];
  condiciones_cronicas?: string[];
  estado: 'activo' | 'inactivo' | 'fallecido';
  foto_url?: string;
  notas?: string;
  created_at: Date;
  duenos?: Dueno[];
}

export interface MascotaFormData {
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: Date | null;
  color: string;
  microchip: string;
  genero: string;
  alergias: string[];
  condiciones_cronicas: string[];
  estado: string;
  foto_url: string;
  notas: string;
  duenos: Dueno[];
}

export function useMascotas() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMascotas = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: mascotasData, error: mascotasError } = await supabase
        .from('mascotas')
        .select(`
          *,
          mascota_duenos (
            es_principal,
            owners (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (mascotasError) throw mascotasError;

      const formattedMascotas: Mascota[] = (mascotasData || []).map(mascota => {
        const duenos = mascota.mascota_duenos?.map((md: any) => ({
          id: md.owners.id,
          name: md.owners.name || '',
          phone: md.owners.phone || '',
          email: md.owners.email || '',
          address: md.owners.address || '',
          emergency_contact: md.owners.emergency_contact || '',
          relationship: md.owners.relationship || 'propietario',
          notes: md.owners.notes || '',
          es_principal: md.es_principal || false,
        })) || [];

        return {
          ...mascota,
          fecha_nacimiento: mascota.fecha_nacimiento ? new Date(mascota.fecha_nacimiento) : undefined,
          created_at: new Date(mascota.created_at),
          alergias: mascota.alergias || [],
          condiciones_cronicas: mascota.condiciones_cronicas || [],
          estado: mascota.estado as 'activo' | 'inactivo' | 'fallecido',
          duenos: duenos,
        };
      });

      setMascotas(formattedMascotas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar mascotas';
      console.error('Error loading mascotas:', err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createMascota = async (formData: MascotaFormData) => {
    if (!user) {
      toast({ title: 'Error', description: 'Debes estar autenticado', variant: 'destructive' });
      return false;
    }

    try {
      setSaving(true);

      const mascotaData = {
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza || null,
        fecha_nacimiento: formData.fecha_nacimiento?.toISOString().split('T')[0] || null,
        color: formData.color || null,
        microchip: formData.microchip || null,
        genero: formData.genero || null,
        alergias: formData.alergias || [],
        condiciones_cronicas: formData.condiciones_cronicas || [],
        estado: formData.estado,
        foto_url: formData.foto_url || null,
        notas: formData.notas || null,
      };

      const { data: newMascota, error: mascotaError } = await supabase
        .from('mascotas')
        .insert([mascotaData])
        .select()
        .single();

      if (mascotaError) throw mascotaError;

      // Crear dueños y relaciones
      for (const duenoData of formData.duenos) {
        let ownerId = duenoData.id;

        // Si no tiene ID, crear un nuevo owner
        if (!ownerId) {
          const { data: newOwner, error: ownerError } = await supabase
            .from('owners')
            .insert({
              name: duenoData.name,
              phone: duenoData.phone || null,
              email: duenoData.email || null,
              address: duenoData.address || null,
              emergency_contact: duenoData.emergency_contact || null,
              relationship: duenoData.relationship,
              notes: duenoData.notes || null,
            })
            .select()
            .single();

          if (ownerError) throw ownerError;
          ownerId = newOwner.id;
        }

        // Crear relación con el owner (existente o nuevo)
        const { error: relationError } = await supabase
          .from('mascota_duenos')
          .insert({
            mascota_id: newMascota.id,
            owner_id: ownerId,
            es_principal: duenoData.es_principal,
          });

        if (relationError) throw relationError;
      }

      toast({
        title: 'Éxito',
        description: 'Mascota creada correctamente',
      });

      await fetchMascotas();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear mascota';
      console.error('Error creating mascota:', err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateMascota = async (mascotaId: string, formData: MascotaFormData) => {
    if (!user) {
      toast({ title: 'Error', description: 'Debes estar autenticado', variant: 'destructive' });
      return false;
    }

    try {
      setSaving(true);

      const mascotaData = {
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza || null,
        fecha_nacimiento: formData.fecha_nacimiento?.toISOString().split('T')[0] || null,
        color: formData.color || null,
        microchip: formData.microchip || null,
        genero: formData.genero || null,
        alergias: formData.alergias || [],
        condiciones_cronicas: formData.condiciones_cronicas || [],
        estado: formData.estado,
        foto_url: formData.foto_url || null,
        notas: formData.notas || null,
      };

      const { error: mascotaError } = await supabase
        .from('mascotas')
        .update(mascotaData)
        .eq('id', mascotaId);

      if (mascotaError) throw mascotaError;

      // Eliminar relaciones existentes
      const { error: deleteError } = await supabase
        .from('mascota_duenos')
        .delete()
        .eq('mascota_id', mascotaId);

      if (deleteError) throw deleteError;

      // Crear o actualizar dueños y relaciones
      for (const duenoData of formData.duenos) {
        let ownerId = duenoData.id;

        // Si no tiene ID, crear un nuevo owner
        if (!ownerId) {
          const { data: newOwner, error: ownerError } = await supabase
            .from('owners')
            .insert({
              name: duenoData.name,
              phone: duenoData.phone || null,
              email: duenoData.email || null,
              address: duenoData.address || null,
              emergency_contact: duenoData.emergency_contact || null,
              relationship: duenoData.relationship,
              notes: duenoData.notes || null,
            })
            .select()
            .single();

          if (ownerError) throw ownerError;
          ownerId = newOwner.id;
        }
        // Si tiene ID, es un owner existente, no lo actualizamos, solo creamos la relación

        // Crear relación en mascota_duenos
        const { error: relationError } = await supabase
          .from('mascota_duenos')
          .insert({
            mascota_id: mascotaId,
            owner_id: ownerId,
            es_principal: duenoData.es_principal,
          });

        if (relationError) throw relationError;
      }

      toast({
        title: 'Éxito',
        description: 'Mascota actualizada correctamente',
      });

      await fetchMascotas();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar mascota';
      console.error('Error updating mascota:', err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteMascota = async (mascotaId: string) => {
    if (!user) {
      toast({ title: 'Error', description: 'Debes estar autenticado', variant: 'destructive' });
      return false;
    }

    try {
      const { error } = await supabase
        .from('mascotas')
        .delete()
        .eq('id', mascotaId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Mascota eliminada correctamente',
      });

      await fetchMascotas();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar mascota';
      console.error('Error deleting mascota:', err);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, [user]);

  return {
    mascotas,
    loading,
    saving,
    createMascota,
    updateMascota,
    deleteMascota,
    refetch: fetchMascotas,
  };
}
