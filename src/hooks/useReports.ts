import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  patientId?: string;
  species?: string;
  reportType?: 'mascotas' | 'duenos' | 'medical_records' | 'general';
}

export interface PatientReport {
  id: string;
  name: string;
  owner_name: string;
  ownerName: string; // Alias for compatibility
  species: string;
  breed: string | null;
  birth_date: string | null;
  gender: string | null;
  phone: string | null;
  ownerPhone: string | null; // Alias for compatibility
  email: string | null;
  created_at: string;
  status: string;
  age: number | null; // Add age field
  total_appointments: number;
  total_medical_records: number;
  last_visit: string | null;
  lastVisit: string | null; // Alias for compatibility
}

export interface AppointmentReport {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  date: string; // Add date field
  time: string; // Add time field
  status: string;
  type: string | null;
  reason: string | null; // Add reason field
  veterinarian: string | null;
  patient_name: string;
  patientName: string; // Alias for compatibility
  owner_name: string;
  ownerName: string; // Alias for compatibility
  species: string;
  created_at: string;
}

export interface MedicalRecordReport {
  id: string;
  date: string;
  type: string;
  veterinarian: string;
  symptoms: string | null;
  diagnosis: string | null;
  treatment: string | null;
  medications: any[];
  weight: number | null;
  temperature: number | null;
  priority: string;
  status: string;
  patient_name: string;
  patientName: string; // Alias for compatibility
  owner_name: string;
  species: string;
  notes: string | null; // Add notes field
  created_at: string;
}

export interface GeneralStats {
  totalPatients: number;
  totalMedicalRecords: number;
  speciesCount: number;
  patientsBySpecies: { species: string; count: number }[];
  medicalRecordsByType: { type: string; count: number }[];
  monthlyStats: {
    month: string;
    patients: number;
    medical_records: number;
  }[];
  revenueByService: {
    service: string;
    count: number;
    estimated_revenue: number;
  }[];
}

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generatePatientReport = async (filters: ReportFilters = {}): Promise<PatientReport[]> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('mascotas')
        .select(`
          *,
          mascota_duenos!inner(
            owners(name, phone, email)
          ),
          medical_records(id)
        `);

      if (filters.species && filters.species !== 'all') {
        query = query.eq('especie', filters.species);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters.patientId && filters.patientId !== 'all') {
        query = query.eq('id', filters.patientId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to include aggregated information
      const transformedData: PatientReport[] = (data || []).map((mascota: any) => {
        const calculateAge = (birthDate: string | null) => {
          if (!birthDate) return null;
          const birth = new Date(birthDate);
          const now = new Date();
          const ageInYears = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          return ageInYears;
        };

        // Get primary owner
        const primaryOwner = mascota.mascota_duenos?.find((md: any) => md.es_principal);
        const ownerData = primaryOwner?.owners || mascota.mascota_duenos?.[0]?.owners;

        return {
          id: mascota.id,
          name: mascota.nombre,
          owner_name: ownerData?.name || 'N/A',
          ownerName: ownerData?.name || 'N/A',
          species: mascota.especie,
          breed: mascota.raza,
          birth_date: mascota.fecha_nacimiento,
          gender: mascota.genero,
          phone: ownerData?.phone || null,
          ownerPhone: ownerData?.phone || null,
          email: ownerData?.email || null,
          created_at: mascota.created_at,
          status: mascota.estado,
          age: calculateAge(mascota.fecha_nacimiento),
          total_appointments: 0,
          total_medical_records: mascota.medical_records?.length || 0,
          last_visit: null,
          lastVisit: null
        };
      });

      return transformedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar reporte de mascotas';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateMedicalRecordReport = async (filters: ReportFilters = {}): Promise<MedicalRecordReport[]> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('medical_records')
        .select(`
          *,
          patient:mascotas(nombre, especie, raza)
        `);

      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      const { data, error: fetchError } = await query.order('date', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedData: MedicalRecordReport[] = (data || []).map((record: any) => ({
        id: record.id,
        date: record.date,
        type: record.type,
        veterinarian: record.veterinarian,
        symptoms: record.symptoms,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        medications: Array.isArray(record.medications) ? record.medications : 
                      typeof record.medications === 'string' ? [record.medications] : [],
        weight: record.weight,
        temperature: record.temperature,
        priority: record.priority,
        status: record.status,
        patient_name: record.patient?.nombre || 'N/A',
        patientName: record.patient?.nombre || 'N/A',
        owner_name: 'N/A',
        species: record.patient?.especie || 'N/A',
        notes: record.notes || null,
        created_at: record.created_at,
      }));

      return transformedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar reporte de historias médicas';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateGeneralStats = async (filters: ReportFilters = {}): Promise<GeneralStats> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setLoading(true);
      setError(null);

      // Get total counts
      const [mascotasResult, medicalRecordsResult] = await Promise.all([
        supabase.from('mascotas').select('*', { count: 'exact', head: true }),
        supabase.from('medical_records').select('*', { count: 'exact', head: true }),
      ]);

      // Get patients by species
      const { data: mascotasBySpecies } = await supabase
        .from('mascotas')
        .select('especie');

      const speciesCounts = mascotasBySpecies?.reduce((acc, mascota) => {
        acc[mascota.especie] = (acc[mascota.especie] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get medical records by type
      const { data: medicalRecordsByType } = await supabase
        .from('medical_records')
        .select('type');

      const typeCounts = medicalRecordsByType?.reduce((acc, record) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get monthly stats (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [monthlyMascotas, monthlyMedicalRecords] = await Promise.all([
        supabase
          .from('mascotas')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString()),
        supabase
          .from('medical_records')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString()),
      ]);

      // Process monthly data
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

        const patientsCount = monthlyMascotas.data?.filter(p => 
          p.created_at.startsWith(monthKey)
        ).length || 0;

        const medicalRecordsCount = monthlyMedicalRecords.data?.filter(m => 
          m.created_at.startsWith(monthKey)
        ).length || 0;

        monthlyStats.push({
          month: monthName,
          patients: patientsCount,
          medical_records: medicalRecordsCount,
        });
      }

      // Estimated revenue by service type (mock data based on medical records)
      const serviceRevenue = Object.entries(typeCounts).map(([service, count]) => {
        const basePrice = {
          'consulta': 150,
          'vacunacion': 200,
          'cirugia': 1500,
          'emergencia': 500,
          'revision': 100,
          'control': 80,
        }[service] || 100;

        return {
          service: service.charAt(0).toUpperCase() + service.slice(1),
          count,
          estimated_revenue: count * basePrice,
        };
      });

      return {
        totalPatients: mascotasResult.count || 0,
        totalMedicalRecords: medicalRecordsResult.count || 0,
        speciesCount: Object.keys(speciesCounts).length,
        patientsBySpecies: Object.entries(speciesCounts).map(([species, count]) => ({
          species: species.charAt(0).toUpperCase() + species.slice(1),
          count,
        })),
        medicalRecordsByType: Object.entries(typeCounts).map(([type, count]) => ({
          type: type.charAt(0).toUpperCase() + type.slice(1),
          count,
        })),
        monthlyStats,
        revenueByService: serviceRevenue,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar estadísticas generales';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generatePatientReport,
    generateMedicalRecordReport,
    generateGeneralStats,
  };
}