import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  PawPrint,
  Heart,
  Plus,
  BarChart3,
  Stethoscope,
  CalendarDays,
  AlertCircle,
  Bell,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useDashboardStats, useRecentPatients } from '@/hooks/useSupabaseData';
import { useAppointments } from '@/hooks/useAppointments';
import { format, isSameDay, parseISO, startOfWeek, addDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { patients, loading: patientsLoading } = useRecentPatients();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  const isLoading = statsLoading || patientsLoading;

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Filtrar citas de hoy
  const todayAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter(apt => isSameDay(parseISO(apt.start_time), today))
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());
  }, [appointments]);

  // Generar datos para gráfico de tendencias (últimas 4 semanas)
  const weeklyTrends = useMemo(() => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = addDays(now, -7 * (i + 1));
      const weekEnd = addDays(now, -7 * i);
      
      const weekAppointments = appointments.filter(apt => {
        const aptDate = parseISO(apt.start_time);
        return aptDate >= weekStart && aptDate < weekEnd;
      });

      weeks.push({
        name: i === 0 ? 'Esta semana' : `${i + 1} sem atrás`,
        consultas: weekAppointments.length
      });
    }
    
    return weeks;
  }, [appointments]);

  // Calendario semanal
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i);
      const dayAppointments = appointments.filter(apt => 
        isSameDay(parseISO(apt.start_time), day)
      );
      
      return {
        date: day,
        dayName: format(day, 'EEE', { locale: es }),
        dayNumber: format(day, 'd'),
        isToday: isToday(day),
        appointmentsCount: dayAppointments.length
      };
    });
  }, [appointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Veterinario</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Panel de control veterinario - {currentDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/25"
              onClick={() => navigate('/pacientes')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Mascota
            </Button>
          </div>
        </div>

        {/* Estadísticas principales con datos reales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Tarjeta Citas del Día - CLICKEABLE */}
          <Card 
            className="bg-white border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              navigate(`/calendario?date=${today}`);
            }}
          >
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eventos del Día</p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {isLoading ? '...' : stats.todayAppointments}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Sincronizado con calendario</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl">
                  <CalendarDays className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta Estadísticas de Especies */}
          <Card className="bg-white border-0 shadow-lg shadow-green-500/5 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Especies Atendidas</p>
                  <div className="flex gap-3 mt-2">
                    <div>
                      <p className="text-lg font-bold text-foreground">{isLoading ? '...' : stats.speciesStats.perros}</p>
                      <p className="text-xs text-muted-foreground">Perros</p>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{isLoading ? '...' : stats.speciesStats.gatos}</p>
                      <p className="text-xs text-muted-foreground">Gatos</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl">
                  <PawPrint className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoading ? 'Cargando...' : stats.speciesStats.message}
              </p>
            </CardContent>
          </Card>

          {/* Tarjeta Consultas Frecuentes */}
          <Card className="bg-white border-0 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Consultas Más Frecuentes</p>
                  {isLoading ? (
                    <p className="text-xs text-muted-foreground">Cargando...</p>
                  ) : stats.topConsultTypes.length > 0 ? (
                    <div className="space-y-1">
                      {stats.topConsultTypes.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground truncate">{item.type}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin datos aún</p>
                  )}
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl ml-3">
                  <Stethoscope className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de 2 columnas para secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda: Citas del día */}
          <Card className="bg-white border-0 shadow-lg shadow-blue-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Citas de Hoy</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/calendario')}
              >
                Ver todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse p-3 rounded-lg bg-muted/30">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {todayAppointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/calendario')}
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(apt.start_time), 'HH:mm')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(apt.end_time), 'HH:mm')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{apt.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{apt.type || 'Consulta'}</p>
                        {apt.veterinarian && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            Dr. {apt.veterinarian}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={apt.status === 'completed' ? 'default' : apt.status === 'cancelled' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {apt.status === 'scheduled' ? 'Agendada' : apt.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No hay citas programadas para hoy</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/calendario')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar cita
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columna Derecha: Tendencias y calendario semanal */}
          <div className="space-y-6">
            {/* Gráfico de tendencias */}
            <Card className="bg-white border-0 shadow-lg shadow-purple-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Tendencia de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="consultas" 
                      fill="hsl(var(--primary))" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mini calendario semanal */}
            <Card className="bg-white border-0 shadow-lg shadow-cyan-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Vista Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={`
                        p-3 rounded-lg text-center cursor-pointer transition-all
                        ${day.isToday 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : day.appointmentsCount > 0
                          ? 'bg-purple-500/10 hover:bg-purple-500/20'
                          : 'bg-muted/30 hover:bg-muted/50'
                        }
                      `}
                      onClick={() => navigate('/calendario')}
                    >
                      <div className="text-xs font-medium mb-1">{day.dayName}</div>
                      <div className={`text-lg font-bold ${day.isToday ? '' : 'text-foreground'}`}>
                        {day.dayNumber}
                      </div>
                      {day.appointmentsCount > 0 && (
                        <div className="mt-1">
                          <Badge 
                            variant={day.isToday ? "secondary" : "outline"} 
                            className="text-xs px-1 py-0"
                          >
                            {day.appointmentsCount}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pacientes Recientes y Acciones Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pacientes Recientes */}
          <Card className="bg-white border-0 shadow-lg shadow-cyan-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Pacientes Recientes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/pacientes')}
              >
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : patients.length > 0 ? (
                <div className="space-y-2">
                  {patients.slice(0, 5).map((patient) => (
                    <div 
                      key={patient.id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate('/pacientes')}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center shrink-0">
                        <PawPrint className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{patient.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {patient.duenos?.[0]?.name || 'Sin dueño'}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{patient.especie}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <PawPrint className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No hay pacientes registrados</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/pacientes')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar primer paciente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="bg-white border-0 shadow-lg shadow-cyan-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                onClick={() => navigate('/pacientes')}
              >
                <PawPrint className="h-4 w-4 mr-2" />
                Registrar Paciente
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/calendario')}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/historia-medica')}
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Historia Médica
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/reports')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Need Help section */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/20 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">¿Necesitas ayuda?</h3>
                <p className="text-sm text-muted-foreground">Contacta con nuestro equipo de soporte</p>
              </div>
              <Button 
                variant="outline" 
                className="bg-white"
                onClick={() => window.location.href = 'mailto:info@patagoniasolutions.tech'}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Contactar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}