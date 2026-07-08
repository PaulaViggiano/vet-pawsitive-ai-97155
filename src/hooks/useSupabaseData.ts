import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPatients: number;
  activeClients: number;
  monthlyRevenue: number;
  todayAppointments: number;
  todayPatients: number;
  todayOwners: number;
  speciesStats: {
    perros: number;
    gatos: number;
    message: string;
  };
  topConsultTypes: Array<{
    type: string;
    count: number;
  }>;
}

interface RecentMascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string | null;
  created_at: string;
  estado: string;
  duenos?: {
    name: string;
  }[];
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeClients: 0,
    monthlyRevenue: 0,
    todayAppointments: 0,
    todayPatients: 0,
    todayOwners: 0,
    speciesStats: {
      perros: 0,
      gatos: 0,
      message: ''
    },
    topConsultTypes: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Get total mascotas
        const { count: mascotasCount } = await supabase
          .from('mascotas')
          .select('*', { count: 'exact', head: true });

        // Get active clients (unique owners)
        const { count: ownersCount } = await supabase
          .from('owners')
          .select('*', { count: 'exact', head: true });

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's appointments
        const { data: todayAppointmentsData } = await supabase
          .from('appointments')
          .select('*, patient_id, owner_id')
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString())
          .eq('user_id', user.id);

        // Get unique patient IDs and owner IDs from today's appointments
        const uniquePatientIds = new Set(
          todayAppointmentsData?.map(apt => apt.patient_id).filter(Boolean) || []
        );
        const uniqueOwnerIds = new Set(
          todayAppointmentsData?.map(apt => apt.owner_id).filter(Boolean) || []
        );

        // Get species statistics for this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthlyAppointments } = await supabase
          .from('appointments')
          .select('patient_id, title')
          .gte('start_time', startOfMonth.toISOString())
          .eq('user_id', user.id);

        console.log('Monthly appointments:', monthlyAppointments);

        // Get all mascotas to match by name
        const { data: allMascotas } = await supabase
          .from('mascotas')
          .select('id, nombre, especie');

        console.log('All mascotas:', allMascotas);

        let perros = 0;
        let gatos = 0;

        // Count species from appointments
        monthlyAppointments?.forEach(apt => {
          let mascota = null;
          
          // Try to find by patient_id first
          if (apt.patient_id) {
            mascota = allMascotas?.find(m => m.id === apt.patient_id);
          }
          
          // If not found by ID, try to match by name in title
          if (!mascota && apt.title) {
            const titleLower = apt.title.toLowerCase();
            mascota = allMascotas?.find(m => 
              titleLower.includes(m.nombre.toLowerCase())
            );
          }

          // Count species
          if (mascota) {
            if (mascota.especie.toLowerCase() === 'perro') perros++;
            if (mascota.especie.toLowerCase() === 'gato') gatos++;
          }
        });

        console.log('Perros:', perros, 'Gatos:', gatos);

        let speciesMessage = '';
        if (perros > gatos) {
          speciesMessage = `Este mes atendiste más perros (${perros}) que gatos (${gatos})`;
        } else if (gatos > perros) {
          speciesMessage = `Este mes atendiste más gatos (${gatos}) que perros (${perros})`;
        } else if (perros === gatos && perros > 0) {
          speciesMessage = `Este mes atendiste la misma cantidad de perros y gatos (${perros} cada uno)`;
        } else {
          speciesMessage = 'Sin datos este mes';
        }

        // Get top consultation types
        const { data: allAppointments } = await supabase
          .from('appointments')
          .select('type')
          .eq('user_id', user.id)
          .not('type', 'is', null);

        const typeCount: Record<string, number> = {};
        allAppointments?.forEach(apt => {
          if (apt.type) {
            typeCount[apt.type] = (typeCount[apt.type] || 0) + 1;
          }
        });

        const topConsultTypes = Object.entries(typeCount)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        setStats({
          totalPatients: mascotasCount || 0,
          activeClients: ownersCount || 0,
          monthlyRevenue: 45230,
          todayAppointments: todayAppointmentsData?.length || 0,
          todayPatients: uniquePatientIds.size,
          todayOwners: uniqueOwnerIds.size,
          speciesStats: {
            perros,
            gatos,
            message: speciesMessage
          },
          topConsultTypes
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
}

export function useRecentPatients() {
  const [patients, setPatients] = useState<RecentMascota[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchPatients = async () => {
      try {
        const { data: mascotas, error } = await supabase
          .from('mascotas')
          .select(`
            *,
            mascota_duenos!inner(
              owners!inner(name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        
        // Transform data to match expected format
        const transformedData = mascotas?.map(m => ({
          id: m.id,
          nombre: m.nombre,
          especie: m.especie,
          raza: m.raza,
          created_at: m.created_at,
          estado: m.estado,
          duenos: m.mascota_duenos?.map((md: any) => ({
            name: md.owners.name
          }))
        })) || [];

        setPatients(transformedData);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  return { patients, loading };
}