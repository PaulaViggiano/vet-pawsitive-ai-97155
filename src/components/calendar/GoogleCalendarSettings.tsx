import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, X } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

export function GoogleCalendarSettings() {
  const { isConnected, loading, connectGoogleCalendar, disconnectGoogleCalendar } = useGoogleCalendar();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sincronización con Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sincronización con Google Calendar
        </CardTitle>
        <CardDescription>
          Sincroniza automáticamente tus citas con Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Estado:</span>
            {isConnected ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <X className="h-3 w-3" />
                Desconectado
              </Badge>
            )}
          </div>
          
          {isConnected ? (
            <Button variant="destructive" onClick={disconnectGoogleCalendar}>
              Desconectar
            </Button>
          ) : (
            <Button onClick={connectGoogleCalendar}>
              Conectar con Google
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Sincronización activa</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Las citas nuevas se crearán automáticamente en Google Calendar</li>
              <li>• Las actualizaciones se sincronizan en ambas direcciones</li>
              <li>• Las citas eliminadas se removerán de Google Calendar</li>
            </ul>
          </div>
        )}

        {!isConnected && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
              ¿Por qué conectar Google Calendar?
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Accede a tus citas desde cualquier dispositivo</li>
              <li>• Recibe notificaciones de Google Calendar</li>
              <li>• Sincronización automática bidireccional</li>
              <li>• Comparte tu calendario con tu equipo</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}