import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { MedicalRecord } from '@/components/medical/MedicalRecordList';

export type { MedicalRecord } from '@/components/medical/MedicalRecordList';

export function useMedicalRecords(patientId?: string) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  const fetchRecords = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('medical_records')
        .select('*');

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error: fetchError } = await query.order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to match our interface
      const transformedData = (data || []).map((record: any) => ({
        ...record,
        medications: Array.isArray(record.medications) ? record.medications.map(String) : [],
        attachments: record.attachments || [],
        patient: { name: '', owner_name: '', species: '' }
      })) as MedicalRecord[];
      setRecords(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar registros médicos');
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (recordData: any) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: recordData.patientId,
          date: recordData.date,
          type: recordData.type,
          veterinarian: recordData.veterinarian,
          symptoms: recordData.symptoms,
          diagnosis: recordData.diagnosis,
          treatment: recordData.treatment,
          notes: recordData.notes,
          priority: recordData.priority,
          status: recordData.status,
          medications: recordData.medications || [],
          weight: recordData.weight ? parseFloat(recordData.weight) : null,
          temperature: recordData.temperature ? parseFloat(recordData.temperature) : null,
          heart_rate: recordData.heartRate ? parseInt(recordData.heartRate) : null,
          respiratory_rate: recordData.respiratoryRate ? parseInt(recordData.respiratoryRate) : null,
          next_appointment: recordData.next_appointment || null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchRecords();
      return data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateRecord = async (recordId: string, recordData: any) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('medical_records')
        .update({
          patient_id: recordData.patientId || recordData.patient_id,
          date: recordData.date,
          type: recordData.type,
          veterinarian: recordData.veterinarian,
          symptoms: recordData.symptoms,
          diagnosis: recordData.diagnosis,
          treatment: recordData.treatment,
          notes: recordData.notes,
          priority: recordData.priority,
          status: recordData.status,
          medications: recordData.medications || [],
          weight: recordData.weight ? parseFloat(recordData.weight) : null,
          temperature: recordData.temperature ? parseFloat(recordData.temperature) : null,
          heart_rate: recordData.heart_rate ? parseInt(recordData.heart_rate) : null,
          respiratory_rate: recordData.respiratory_rate ? parseInt(recordData.respiratory_rate) : null,
          next_appointment: recordData.next_appointment || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;

      await fetchRecords();
      return data;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      await fetchRecords();
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const searchRecords = async (query: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Simple fetch and filter in memory to avoid TypeScript issues
      const baseQuery = await supabase
        .from('medical_records')
        .select('*')
        .order('date', { ascending: false });

      if (baseQuery.error) throw baseQuery.error;

      // Filter in memory
      let filteredData = baseQuery.data || [];
      
      if (patientId) {
        filteredData = filteredData.filter(r => r.patient_id === patientId);
      }

      if (query.trim()) {
        const searchLower = query.toLowerCase();
        filteredData = filteredData.filter(r => 
          r.diagnosis?.toLowerCase().includes(searchLower) ||
          r.symptoms?.toLowerCase().includes(searchLower) ||
          r.treatment?.toLowerCase().includes(searchLower) ||
          r.notes?.toLowerCase().includes(searchLower) ||
          r.veterinarian?.toLowerCase().includes(searchLower)
        );
      }

      // Transform the data to match our interface
      const transformedData = filteredData.map((record: any) => ({
        ...record,
        medications: Array.isArray(record.medications) ? record.medications.map(String) : [],
        attachments: record.attachments || [],
        patient: { name: '', owner_name: '', species: '' }
      })) as MedicalRecord[];
      
      setRecords(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = async (filters: { type?: string; priority?: string; status?: string }) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('medical_records')
        .select('*');

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error: filterError } = await query.order('date', { ascending: false });

      if (filterError) throw filterError;

      // Transform the data to match our interface
      const transformedData = (data || []).map((record: any) => ({
        ...record,
        medications: Array.isArray(record.medications) ? record.medications.map(String) : [],
        attachments: record.attachments || [],
        patient: { name: '', owner_name: '', species: '' }
      })) as MedicalRecord[];
      setRecords(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar registros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user, patientId]);

  return {
    records,
    loading,
    isLoading,
    isSaving,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    filterRecords,
    refetch: fetchRecords,
  };
}