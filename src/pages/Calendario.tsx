import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';
import { GoogleCalendarSettings } from '@/components/calendar/GoogleCalendarSettings';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Normaliza lo que escriba el usuario a formato HH:MM.
 * Acepta: "15", "15:00", "1500", "15.00", "9", "9:30" → "15:00", "09:30", etc.
 * Devuelve null si no se puede interpretar como hora válida.
 */
function normalizarHora(valor: string): string | null {
  const limpio = valor.replace(/[^\d]/g, ''); // solo dígitos
  if (limpio.length === 0) return null;

  let horas: number;
  let minutos: number;

  if (limpio.length <= 2) {
    horas = parseInt(limpio, 10);
    minutos = 0;
  } else if (limpio.length === 3) {
    horas = parseInt(limpio.slice(0, 1), 10);
    minutos = parseInt(limpio.slice(1), 10);
  } else {
    horas = parseInt(limpio.slice(0, 2), 10);
    minutos = parseInt(limpio.slice(2, 4), 10);
  }

  if (isNaN(horas) || isNaN(minutos) || horas > 23 || minutos > 59) return null;

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

export default function Calendario() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [fechaCancelar, setFechaCancelar] = useState('');
  const [horaDesde, setHoraDesde] = useState('13:00');
  const [horaHasta, setHoraHasta] = useState('17:30');
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
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

  // Al salir del campo, corregimos el formato automáticamente
  const alSalirDeHora = (valor: string, setear: (v: string) => void) => {
    const normalizada = normalizarHora(valor);
    if (normalizada) {
      setear(normalizada);
    }
    // Si no se pudo interpretar, dejamos lo que escribió: la validación final avisa al bloquear
  };

  const horasValidas =
    normalizarHora(horaDesde) !== null && normalizarHora(horaHasta) !== null;

  const esDiaCompleto = horaDesde === '13:00' && horaHasta === '17:30';

  const cancelarDia = async () => {
    const desde = normalizarHora(horaDesde);
    const hasta = normalizarHora(horaHasta);

    if (!fechaCancelar) {
      toast({ title: 'Elegí una fecha primero', variant: 'destructive' });
      return;
    }
    if (!desde || !hasta) {
      toast({
        title: 'Horario inválido',
        description: 'Escribí las horas en formato HH:MM, por ejemplo 15:00.',
        variant: 'destructive',
      });
      return;
    }
    if (hasta <= desde) {
      toast({
        title: 'Horario inválido',
        description: 'La hora de fin debe ser posterior a la de inicio.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCancelando(true);
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'create',
          userId: user!.id,
          appointmentData: {
            title: esDiaCompleto
              ? '🚫 DÍA CANCELADO - NO ATENDER'
              : `🚫 BLOQUEADO ${desde} a ${hasta} - NO ATENDER`,
            description: 'Bloqueo de agenda creado desde el CRM',
            start_time: `${fechaCancelar}T${desde}:00-03:00`,
            end_time: `${fechaCancelar}T${hasta}:00-03:00`,
          },
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast({
        title: esDiaCompleto ? 'Día bloqueado ✅' : `Bloqueado de ${desde} a ${hasta} ✅`,
        description: 'No se podrán agendar turnos nuevos en ese horario.',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'No se pudo bloquear el horario',
        variant: 'destructive',
      });
    } finally {
      setCancelando(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-none px-4 py-4 md:px-8 md:py-6 border-b border-border bg-card/50">
        <div className="flex flex-col gap-4">
          {/* Fila 1: título + Editar Disponibilidad al costado */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendario</h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Gestiona tus citas y eventos veterinarios
              </p>
            </div>
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
          </div>

          {/* Fila 2: herramienta de bloqueo de agenda */}
          <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg border border-border bg-background w-fit max-w-full">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Fecha</label>
              <input
                type="date"
                value={fechaCancelar}
                onChange={(e) => setFechaCancelar(e.target.value)}
                className="px-2 py-1.5 border border-border rounded-md text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Desde</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="13:00"
                maxLength={5}
                value={horaDesde}
                onChange={(e) => setHoraDesde(e.target.value)}
                onBlur={(e) => alSalirDeHora(e.target.value, setHoraDesde)}
                className="w-20 px-2 py-1.5 border border-border rounded-md text-sm bg-background text-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Hasta</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="17:30"
                maxLength={5}
                value={horaHasta}
                onChange={(e) => setHoraHasta(e.target.value)}
                onBlur={(e) => alSalirDeHora(e.target.value, setHoraHasta)}
                className="w-20 px-2 py-1.5 border border-border rounded-md text-sm bg-background text-center"
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={cancelando || !fechaCancelar || !horasValidas}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                    <line x1="12" x2="12" y1="2" y2="12"/>
                  </svg>
                  {cancelando ? 'Bloqueando...' : esDiaCompleto ? 'Cancelar Día Completo' : 'Bloquear Horario'}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {esDiaCompleto
                      ? `¿Bloquear todo el día ${fechaCancelar}?`
                      : `¿Bloquear el ${fechaCancelar} de ${horaDesde} a ${horaHasta}?`}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    El bot no ofrecerá turnos nuevos en ese horario. Los turnos ya agendados
                    no se cancelan — recordá reprogramarlos si los hay.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Volver</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={cancelarDia}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Sí, bloquear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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