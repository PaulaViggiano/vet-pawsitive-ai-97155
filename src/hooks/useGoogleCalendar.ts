import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useGoogleCalendar() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, [user]);

  const checkConnection = async () => {
    if (!user) {
      setIsConnected(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsConnected(!!data);
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para conectar Google Calendar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get auth URL from edge function to ensure consistency
      const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
        body: { action: 'get_auth_url', userId: user.id }
      });

      if (error) throw error;

      if (data?.authUrl) {
        console.log('Redirecting to Google OAuth...');
        window.location.href = data.authUrl;
      } else {
        throw new Error('No auth URL received');
      }
    } catch (error) {
      console.error('Error initiating Google Calendar connection:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la conexión con Google Calendar.',
        variant: 'destructive',
      });
    }
  };

  const handleOAuthCallback = async (code: string) => {
    if (!user) {
      const errorMsg = 'No user found when handling OAuth callback';
      console.error('handleOAuthCallback - ERROR:', errorMsg);
      console.error('handleOAuthCallback - User state:', user);
      console.error('handleOAuthCallback - Code received:', code ? 'YES' : 'NO');
      toast({
        title: 'Error de autenticación',
        description: 'No se pudo identificar tu sesión. Por favor inicia sesión nuevamente.',
        variant: 'destructive',
      });
      throw new Error(errorMsg);
    }

    try {
      setLoading(true);
      console.log('handleOAuthCallback - Starting token exchange');
      console.log('handleOAuthCallback - Code:', code.substring(0, 20) + '...');
      console.log('handleOAuthCallback - User ID:', user.id);
      console.log('handleOAuthCallback - User email:', user.email);
      
      const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
        body: { code, userId: user.id }
      });

      console.log('handleOAuthCallback - Edge function response:', { data, error });

      if (error) {
        console.error('handleOAuthCallback - Edge function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('handleOAuthCallback - Success! Calendar ID:', data.calendarId);
        toast({
          title: 'Conexión exitosa',
          description: 'Tu cuenta de Google Calendar ha sido conectada.',
        });
        setIsConnected(true);
        await checkConnection();
      } else {
        console.error('handleOAuthCallback - OAuth callback failed:', data);
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('handleOAuthCallback - Error during callback processing:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo conectar con Google Calendar.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('google_calendar_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Desconectado',
        description: 'Tu cuenta de Google Calendar ha sido desconectada.',
      });
      
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desconectar Google Calendar.',
        variant: 'destructive',
      });
    }
  };

  const syncAppointment = async (action: 'create' | 'update' | 'delete', appointmentId: string, appointmentData?: any) => {
    if (!user || !isConnected) return { success: false };

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: { action, appointmentId, appointmentData, userId: user.id }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error syncing appointment:', error);
      toast({
        title: 'Error de sincronización',
        description: 'No se pudo sincronizar con Google Calendar.',
        variant: 'destructive',
      });
      return { success: false };
    }
  };

  const fetchGoogleCalendarEvents = async (startDate: Date, endDate: Date) => {
    if (!user || !isConnected) return [];

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'list',
          userId: user.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      if (error) throw error;

      return data?.events || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  };

  const syncGoogleEventsToSupabase = async (startDate: Date, endDate: Date) => {
    if (!user || !isConnected) return;

    try {
      // Obtener eventos de Google Calendar
      const events = await fetchGoogleCalendarEvents(startDate, endDate);
      
      if (!events || events.length === 0) return;

      // Obtener todas las mascotas para matching
      const { data: mascotas } = await supabase
        .from('mascotas')
        .select('id, nombre');

      // Para cada evento de Google Calendar
      for (const event of events) {
        if (!event.start?.dateTime || !event.end?.dateTime) continue;

        // Verificar si ya existe en Supabase
        const { data: existingAppointment } = await supabase
          .from('appointments')
          .select('id')
          .eq('google_calendar_event_id', event.id)
          .eq('user_id', user.id)
          .maybeSingle();

        // Si no existe, crear appointment en Supabase
        if (!existingAppointment) {
          // Intentar extraer patient_id del título del evento
          let patient_id = null;
          const eventTitle = event.summary?.toLowerCase() || '';
          
          // Buscar si el título contiene el nombre de alguna mascota
          const matchedMascota = mascotas?.find(m => 
            eventTitle.includes(m.nombre.toLowerCase())
          );
          
          if (matchedMascota) {
            patient_id = matchedMascota.id;
          }

          const { error: insertError } = await supabase
            .from('appointments')
            .insert({
              user_id: user.id,
              title: event.summary || 'Evento de Google Calendar',
              description: event.description || null,
              start_time: event.start.dateTime,
              end_time: event.end.dateTime,
              google_calendar_event_id: event.id,
              status: 'scheduled',
              type: 'otros',
              modalidad: 'presencial',
              patient_id: patient_id
            });

          if (insertError) {
            console.error('Error inserting appointment from Google Calendar:', insertError);
          }
        }
      }

      toast({
        title: 'Sincronización completada',
        description: 'Los eventos de Google Calendar se han guardado en el CRM.',
      });
    } catch (error) {
      console.error('Error syncing Google Calendar events to Supabase:', error);
    }
  };

  return {
    isConnected,
    loading,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    handleOAuthCallback,
    syncAppointment,
    fetchGoogleCalendarEvents,
    syncGoogleEventsToSupabase,
    refetch: checkConnection,
  };
}