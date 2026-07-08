import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string | null;
  clinic_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        // Si no existe perfil, crear uno
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.email?.split('@')[0] || 'Usuario',
            clinic_name: 'Veterinaria Andrea',
            role: 'veterinario'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          role: updates.role,
          clinic_name: updates.clinic_name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          preferences: updates.preferences,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setProfile(data);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente.",
      });

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { 
    profile, 
    loading, 
    error, 
    updateProfile,
    refetch: fetchProfile 
  };
}