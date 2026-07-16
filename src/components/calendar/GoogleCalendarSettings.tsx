import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Check } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

export function GoogleCalendarSettings() {
  const { isConnected, loading, connectGoogleCalendar, disconnectGoogleCalendar } = useGoogleCalendar();

  // Cargando: una línea discreta, sin tarjeta
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        Verificando conexión con Google Calendar...
      </div>
    );
  }

  // CONECTADO: barrita mínima, todo en una línea
  if (isConnected) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-border bg-muted/30 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground truncate">
            Google Calendar
          </span>
          <span className="inline-flex items-center gap-1 text-green-600 font-medium shrink-0">
            <Check className="h-3.5 w-3.5" />
            Conectado
          </span>
        </div>
        <button
          onClick={disconnectGoogleCalendar}
          className="text-xs text-muted-foreground hover:text-destructive underline-offset-2 hover:underline shrink-0"
        >
          Desconectar
        </button>
      </div>
    );
  }

  // DESCONECTADO: acá sí una tarjeta visible, porque requiere acción
  return (
    <Card className="border-amber-300 bg-amber-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-amber-600" />
          Google Calendar desconectado
        </CardTitle>
        <CardDescription>
          El calendario no puede mostrar tus citas hasta reconectar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={connectGoogleCalendar}>
          Conectar con Google
        </Button>
      </CardContent>
    </Card>
  );
}