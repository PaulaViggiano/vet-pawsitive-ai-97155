import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BotContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export function useBotContacts() {
  const [contacts, setContacts] = useState<BotContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bot_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error al cargar los contactos');
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contact: { name: string; phone: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bot_contacts')
        .insert([{ ...contact, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => [data, ...prev]);
      toast.success('Contacto creado exitosamente');
      return data;
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Error al crear el contacto');
      throw error;
    }
  };

  const updateContact = async (id: string, updates: { name: string; phone: string }) => {
    try {
      const { data, error } = await supabase
        .from('bot_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => prev.map(c => c.id === id ? data : c));
      toast.success('Contacto actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Error al actualizar el contacto');
      throw error;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bot_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contacto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Error al eliminar el contacto');
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    loading,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
}
