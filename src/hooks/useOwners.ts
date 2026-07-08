import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Owner {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  relationship: string | null;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  mascotas?: {
    id: string;
    nombre: string;
    especie: string;
    es_principal: boolean;
  }[];
}

export interface OwnerFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  relationship?: string;
  emergency_contact?: string;
  notes?: string;
}

export function useOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('owners')
        .select(`
          *,
          mascota_duenos(
            es_principal,
            mascotas(
              id,
              nombre,
              especie
            )
          )
        `)
        .order('name');

      if (error) throw error;

      const transformedOwners = data?.map(owner => ({
        ...owner,
        mascotas: owner.mascota_duenos?.map((md: any) => ({
          id: md.mascotas.id,
          nombre: md.mascotas.nombre,
          especie: md.mascotas.especie,
          es_principal: md.es_principal
        })) || []
      })) || [];

      setOwners(transformedOwners);
    } catch (error: any) {
      console.error('Error fetching owners:', error);
      toast.error('Error al cargar los dueños');
    } finally {
      setLoading(false);
    }
  };

  const createOwner = async (formData: OwnerFormData) => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('owners')
        .insert([{
          user_id: user?.id,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          relationship: formData.relationship || null,
          emergency_contact: formData.emergency_contact || null,
          notes: formData.notes || null,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Dueño creado exitosamente');
      await fetchOwners();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating owner:', error);
      toast.error('Error al crear el dueño');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const updateOwner = async (ownerId: string, formData: OwnerFormData) => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('owners')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          relationship: formData.relationship || null,
          emergency_contact: formData.emergency_contact || null,
          notes: formData.notes || null,
        })
        .eq('id', ownerId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Dueño actualizado exitosamente');
      await fetchOwners();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating owner:', error);
      toast.error('Error al actualizar el dueño');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const deleteOwner = async (ownerId: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('owners')
        .delete()
        .eq('id', ownerId);

      if (error) throw error;

      toast.success('Dueño eliminado exitosamente');
      await fetchOwners();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting owner:', error);
      toast.error('Error al eliminar el dueño');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOwners();
    }
  }, [user]);

  return {
    owners,
    loading,
    saving,
    createOwner,
    updateOwner,
    deleteOwner,
    refetch: fetchOwners,
  };
}
