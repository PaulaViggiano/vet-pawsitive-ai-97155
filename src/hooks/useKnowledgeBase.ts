import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface KnowledgeBaseEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export function useKnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadEntries = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedEntries: KnowledgeBaseEntry[] = (data || []).map(entry => ({
        ...entry,
        created_at: new Date(entry.created_at),
        updated_at: new Date(entry.updated_at),
        tags: entry.tags || []
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading knowledge base entries:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entradas de la base de conocimiento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createEntry = async (entryData: Omit<KnowledgeBaseEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert([{...entryData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const newEntry: KnowledgeBaseEntry = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setEntries(prev => [newEntry, ...prev]);
      
      toast({
        title: 'Éxito',
        description: 'Entrada creada correctamente',
      });

      return newEntry;
    } catch (error) {
      console.error('Error creating knowledge base entry:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la entrada',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEntry = async (id: string, entryData: Partial<KnowledgeBaseEntry>) => {
    try {
      setIsSaving(true);
      
      // Create clean update data with only allowed fields
      const cleanData: {
        title?: string;
        content?: string;
        category?: string;
        tags?: string[];
        is_public?: boolean;
      } = {};
      
      if (entryData.title !== undefined) cleanData.title = entryData.title;
      if (entryData.content !== undefined) cleanData.content = entryData.content;
      if (entryData.category !== undefined) cleanData.category = entryData.category;
      if (entryData.tags !== undefined) cleanData.tags = entryData.tags;
      if (entryData.is_public !== undefined) cleanData.is_public = entryData.is_public;
      
      const { data, error } = await supabase
        .from('knowledge_base')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedEntry: KnowledgeBaseEntry = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setEntries(prev => 
        prev.map(entry => entry.id === id ? updatedEntry : entry)
      );

      toast({
        title: 'Éxito',
        description: 'Entrada actualizada correctamente',
      });

      return updatedEntry;
    } catch (error) {
      console.error('Error updating knowledge base entry:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la entrada',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== id));

      toast({
        title: 'Éxito',
        description: 'Entrada eliminada correctamente',
      });
    } catch (error) {
      console.error('Error deleting knowledge base entry:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la entrada',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  return {
    entries,
    isLoading,
    isSaving,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch: loadEntries
  };
}