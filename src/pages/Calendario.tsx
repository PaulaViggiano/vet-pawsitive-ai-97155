import { useEffect } from 'react';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';
import { GoogleCalendarSettings } from '@/components/calendar/GoogleCalendarSettings';
import { useToast } from '@/hooks/use-toast';

export default function Calendario() {
  const { toast } = useToast();

  useEffect(() => {
    // Check for connection success
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');
    
    if (connected === 'true') {
      toast({
        title: "¡Conectado!",
        description: "Google Calendar se ha conectado correctamente",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con Google Calendar",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-none px-8 py-6 border-b border-border bg-card/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
            <p className="text-muted-foreground mt-2">Gestiona tus citas y eventos veterinarios</p>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <a
              href="https://calendar.google.com/calendar/r/eventedit?dates=all_day"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                <line x1="12" x2="12" y1="2" y2="12"/>
              </svg>
              Cancelar Día Completo
            </a>
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
