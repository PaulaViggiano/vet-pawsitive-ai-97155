import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  type?: 'consulta' | 'cirugia' | 'vacunacion' | 'control' | 'emergencia' | 'otros';
  patient_id?: string;
  owner_id?: string;
  veterinarian?: string;
  notes?: string;
  google_calendar_event_id?: string;
  created_at: string;
  updated_at: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  status?: string;
  created?: string;
  updated?: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if Google Calendar is connected
  const checkConnection = useCallback(async () => {
    if (!user) {
      setIsConnected(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      const connected = !!data;
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      setIsConnected(false);
      return false;
    }
  }, [user]);

  // Map Google Calendar event to Appointment format
  const mapGoogleEventToAppointment = (event: GoogleCalendarEvent): Appointment => {
    const startTime = event.start?.dateTime || event.start?.date || new Date().toISOString();
    const endTime = event.end?.dateTime || event.end?.date || new Date().toISOString();
    
    // Parse type from description if available
    let type: Appointment['type'] = 'otros';
    const description = event.description?.toLowerCase() || '';
    if (description.includes('consulta')) type = 'consulta';
    else if (description.includes('cirugia') || description.includes('cirugía')) type = 'cirugia';
    else if (description.includes('vacuna')) type = 'vacunacion';
    else if (description.includes('control')) type = 'control';
    else if (description.includes('emergencia')) type = 'emergencia';

    // Map Google Calendar status to our status
    let status: Appointment['status'] = 'scheduled';
    if (event.status === 'cancelled') status = 'cancelled';
    else if (event.status === 'confirmed') status = 'scheduled';

    return {
      id: event.id,
      title: event.summary || 'Sin título',
      description: event.description,
      start_time: startTime,
      end_time: endTime,
      status,
      type,
      google_calendar_event_id: event.id,
      created_at: event.created || new Date().toISOString(),
      updated_at: event.updated || new Date().toISOString(),
    };
  };

  // Fetch appointments from Google Calendar
  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const connected = await checkConnection();
      
      if (!connected) {
        setAppointments([]);
        setError('Google Calendar no está conectado. Conecta tu cuenta en Configuración.');
        return;
      }

      // Fetch events for a wide date range (past 6 months to future 12 months)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 12);

      const { data, error: fetchError } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'list',
          userId: user.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      if (fetchError) throw fetchError;

      const googleEvents: GoogleCalendarEvent[] = data?.events || [];
      
      // Map Google Calendar events to Appointment format
      const mappedAppointments = googleEvents
        .filter(event => event.start?.dateTime || event.start?.date) // Filter out events without dates
        .map(mapGoogleEventToAppointment)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      setAppointments(mappedAppointments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar citas de Google Calendar';
      setError(errorMessage);
      console.error('Error fetching Google Calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [user, checkConnection]);

  // Create appointment in Google Calendar
  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Fetch patient and owner details for the event description
      let patientName = '';
      let ownerName = '';

      if (appointmentData.patient_id) {
        const { data: patient } = await supabase
          .from('mascotas')
          .select('nombre')
          .eq('id', appointmentData.patient_id)
          .single();
        patientName = patient?.nombre || '';
      }

      let ownerPhone = '';
       if (appointmentData.owner_id) {
        const { data: owner } = await supabase
          .from('owners')
          .select('name, phone')
          .eq('id', appointmentData.owner_id)
          .single();
        ownerName = owner?.name || '';
        ownerPhone = owner?.phone || '';
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'create',
          userId: user.id,
          appointmentData: {
            title: appointmentData.title,
            description: appointmentData.description,
            start_time: appointmentData.start_time,
            end_time: appointmentData.end_time,
            patient_name: patientName,
            owner_name: ownerName,
            owner_phone: ownerPhone,
            type: appointmentData.type,
            veterinarian: appointmentData.veterinarian,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Cita creada",
        description: "La cita se ha creado en Google Calendar.",
      });

      await fetchAppointments();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cita';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update appointment in Google Calendar
  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Fetch patient and owner details
      let patientName = '';
      let ownerName = '';

      if (updates.patient_id) {
        const { data: patient } = await supabase
          .from('mascotas')
          .select('nombre')
          .eq('id', updates.patient_id)
          .single();
        patientName = patient?.nombre || '';
      }

      if (updates.owner_id) {
        const { data: owner } = await supabase
          .from('owners')
          .select('name')
          .eq('id', updates.owner_id)
          .single();
        ownerName = owner?.name || '';
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'update',
          userId: user.id,
          appointmentId: id,
          appointmentData: {
            title: updates.title,
            description: updates.description,
            start_time: updates.start_time,
            end_time: updates.end_time,
            patient_name: patientName,
            owner_name: ownerName,
            type: updates.type,
            veterinarian: updates.veterinarian,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Cita actualizada",
        description: "Los cambios se han guardado en Google Calendar.",
      });

      await fetchAppointments();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cita';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete appointment from Google Calendar
  const deleteAppointment = async (id: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const { error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'delete',
          userId: user.id,
          appointmentId: id,
        }
      });

      if (error) throw error;

      toast({
        title: "Cita eliminada",
        description: "La cita se ha eliminado de Google Calendar.",
      });

      await fetchAppointments();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cita';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    isConnected,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}
