import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, MapPin, Cloud, RefreshCw, AlertCircle } from 'lucide-react';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointments, type Appointment } from '@/hooks/useAppointments';
import { AppointmentDialog } from './AppointmentDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { appointments, loading, error, isConnected, refetch: refetchAppointments } = useAppointments();

  const appointmentsForSelectedDate = appointments.filter((apt) =>
    isSameDay(parseISO(apt.start_time), selectedDate)
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchAppointments();
    setIsRefreshing(false);
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowDialog(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDialog(true);
  };

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'rescheduled':
        return 'Reprogramada';
      default:
        return status;
    }
  };

  // Obtener días con eventos para el mes actual
  const daysWithAppointments = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    
    return appointments
      .filter(apt => {
        const aptDate = parseISO(apt.start_time);
        return aptDate >= monthStart && aptDate <= monthEnd;
      })
      .map(apt => parseISO(apt.start_time));
  }, [appointments, selectedDate]);

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Mensaje si no está conectado a Google Calendar */}
      {!isConnected && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Google Calendar no conectado</AlertTitle>
          <AlertDescription>
            Para ver tus citas, conecta tu cuenta de Google Calendar en{' '}
            <Link to="/configuracion" className="underline font-medium">
              Configuración
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {error && isConnected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Calendario Principal */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Calendario de Citas</CardTitle>
              <p className="text-muted-foreground">Selecciona un día para ver o crear citas</p>
            </div>
            {isConnected && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Cloud className="h-3 w-3 mr-1" />
                Google Calendar
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={es}
            className="rounded-md border shadow-sm w-full transition-all duration-300"
            modifiers={{
              hasAppointment: daysWithAppointments
            }}
            modifiersClassNames={{
              hasAppointment: 'font-bold text-primary'
            }}
          />
        </CardContent>
      </Card>

      {/* Panel de Información del Día Seleccionado */}
      <Card className="w-full animate-scale-in">
        <CardHeader className="border-b bg-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl capitalize">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {appointmentsForSelectedDate.length === 0
                  ? 'No hay eventos programados' 
                  : `${appointmentsForSelectedDate.length} evento${appointmentsForSelectedDate.length !== 1 ? 's' : ''} programado${appointmentsForSelectedDate.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="shadow-sm hover-scale"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={handleCreateAppointment}
                className="flex-1 sm:flex-none shadow-sm hover-scale"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-pulse text-muted-foreground">Cargando eventos...</div>
              </div>
            </div>
          ) : appointmentsForSelectedDate.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg">No hay eventos programados para este día</p>
              <p className="text-muted-foreground/70 text-sm mt-2">Haz clic en "Nueva Cita" para programar una</p>
            </div>
          ) : (
            <div className="space-y-2">
              {appointmentsForSelectedDate.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="cursor-pointer hover:shadow-md hover-scale transition-all duration-200 border-l-4"
                  style={{ borderLeftColor: `hsl(var(--${appointment.status === 'completed' ? 'primary' : appointment.status === 'cancelled' ? 'destructive' : 'accent'}))` }}
                  onClick={() => handleEditAppointment(appointment)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-lg">{appointment.title}</h3>
                          {appointment.google_calendar_event_id && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Cloud className="h-3 w-3 mr-1" />
                              Google
                            </Badge>
                          )}
                          <Badge 
                            variant={appointment.status === 'completed' ? 'default' : appointment.status === 'cancelled' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">
                              {format(parseISO(appointment.start_time), 'HH:mm')} -{' '}
                              {format(parseISO(appointment.end_time), 'HH:mm')}
                            </span>
                          </div>
                          {appointment.veterinarian && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{appointment.veterinarian}</span>
                            </div>
                          )}
                        </div>

                        {appointment.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        appointment={selectedAppointment}
        defaultDate={selectedDate}
      />
    </div>
  );
}
