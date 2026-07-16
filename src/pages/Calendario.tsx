import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';
import { GoogleCalendarSettings } from '@/components/calendar/GoogleCalendarSettings';
import { useToast } from '@/hooks/use-toast';

export default function Calendario() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [fechaCancelar, setFechaCancelar] = useState('');
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    // Check for connection success
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');

    if (connected === 'true') {
      toast({
        title: '¡Conectado!',
        description: 'Google Calendar se ha conectado correctamente',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (error) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con Google Calendar',
        variant: 'destructive',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const cancelarDia = async () => {
    if (!fechaCancelar) {
      toast({ title: 'Elegí una fecha primero', variant: 'destructive' });
      return;
    }
    if (!confirm(`¿Bloquear la agenda completa del ${fechaCancelar}? El bot no ofrecerá turnos ese día.`)) return;

    try {
      setCancelando(true);
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'create',
          userId: user!.id,
          appointmentData: {
            title: '🚫 DÍA CANCELADO - NO ATENDER',
            description: 'Bloqueo de agenda creado desde el CRM',
            start_time: `${fechaCancelar}T13:00:00-03:00`,
            end_time: `${fechaCancelar}T17:30:00-03:00`,
          },
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast({ title: 'Día bloqueado ✅', description: 'No se podrán agendar turnos nuevos ese día.' });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'No se pudo bloquear el día',
        variant: 'destructive',
      });
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-none px-4 py-4 md:px-8 md:py-6 border-b border-border bg-card/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendario</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-lg capitalize">Gestiona tus citas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://app.cal.com/availability/1031583"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              Editar Disponibilidad
            </a>
            <input
              type="date"
              value={fechaCancelar}
              onChange={(e) => setFechaCancelar(e.target.value)}
              className="px-3 py-2 border border-border rounded-md text-sm bg-background"
            />
            <button
              onClick={cancelarDia}
              disabled={cancelando}
              className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                <line x1="12" x2="12" y1="2" y2="12"/>
              </svg>
              {cancelando ? 'Bloqueando...' : 'Cancelar Día Completo'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-auto space-y-6">
        <GoogleCalendarSettings />
        <div className="w-full max-w-7xl mx-auto">
          <AppointmentCalendar />
        </div>
      </div>
    </div>  
  );
}