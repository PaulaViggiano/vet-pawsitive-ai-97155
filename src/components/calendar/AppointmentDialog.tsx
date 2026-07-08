import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAppointments, type Appointment } from "@/hooks/useAppointments";
import { useMascotas } from "@/hooks/useMascotas";
import { useOwners } from "@/hooks/useOwners";
import { Trash2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Combobox } from "@/components/ui/combobox";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  defaultDate?: Date;
}

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  defaultDate = new Date(),
}: AppointmentDialogProps) {
  const { createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { mascotas } = useMascotas();
  const { owners } = useOwners();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_hour: "8:00",
    end_hour: "8:30",
    status: "scheduled" as Appointment["status"],
    type: "consulta" as Appointment["type"],
    veterinarian: "",
    notes: "",
    patient_id: "",
    owner_id: "",
    modalidad: "presencial" as "presencial" | "virtual",
  });

  // Horarios permitidos: 8:00 - 21:00 en intervalos de 30min
  const AVAILABLE_HOURS = [
    "8:00", "8:30", "9:00", "9:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00",
  ];

  // Función para obtener horarios de fin disponibles según hora inicio
  const getEndHours = (startHour: string) => {
    const startIndex = AVAILABLE_HOURS.indexOf(startHour);
    if (startIndex === -1 || startIndex === AVAILABLE_HOURS.length - 1) return [];
    return AVAILABLE_HOURS.slice(startIndex + 1);
  };

  // Auto-seleccionar hora fin cuando cambia hora inicio
  const handleStartHourChange = (hour: string) => {
    setFormData((prev) => ({
      ...prev,
      start_hour: hour,
      end_hour: AVAILABLE_HOURS[AVAILABLE_HOURS.indexOf(hour) + 1] || hour,
    }));
  };

  // Validar que sea día laborable (Lunes-Viernes)
  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Domingo, 6 = Sábado
  };

  useEffect(() => {
    if (appointment) {
      const startDate = new Date(appointment.start_time);
      const endDate = new Date(appointment.end_time);

      setSelectedDate(startDate);
      setFormData({
        title: appointment.title,
        description: appointment.description || "",
        start_hour: format(startDate, "HH:mm"),
        end_hour: format(endDate, "HH:mm"),
        status: appointment.status,
        type: appointment.type || "consulta",
        veterinarian: appointment.veterinarian || "",
        notes: appointment.notes || "",
        patient_id: appointment.patient_id || "",
        owner_id: appointment.owner_id || "",
        modalidad: (appointment as any).modalidad || "presencial",
      });
    } else {
      setSelectedDate(defaultDate);
      setFormData({
        title: "",
        description: "",
        start_hour: "8:00",
        end_hour: "8:30",
        status: "scheduled",
        type: "consulta",
        veterinarian: "",
        notes: "",
        patient_id: "",
        owner_id: "",
        modalidad: "presencial",
      });
    }
  }, [appointment, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que se haya seleccionado una mascota
    if (!formData.patient_id) {
      alert("Por favor selecciona una mascota para la cita");
      return;
    }

    // Validar día laborable
    if (!isWeekday(selectedDate)) {
      alert("Solo se pueden agendar citas de lunes a viernes");
      return;
    }

    // Construir fechas completas con hora
    const [startHour, startMinute] = formData.start_hour.split(":").map(Number);
    const [endHour, endMinute] = formData.end_hour.split(":").map(Number);

    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Validate that end time is after start time
    if (endTime <= startTime) {
      alert("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    const appointmentData = {
      title: formData.title,
      description: formData.description,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: formData.status,
      type: formData.type,
      veterinarian: formData.veterinarian,
      notes: formData.notes,
      patient_id: formData.patient_id || null,
      owner_id: formData.owner_id || null,
      modalidad: formData.modalidad,
    };

    if (appointment) {
      await updateAppointment(appointment.id, appointmentData);
    } else {
      await createAppointment(appointmentData);
    }

    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (appointment) {
      await deleteAppointment(appointment.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{appointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
            <DialogDescription>
              {appointment ? "Modifica los detalles de la cita" : "Completa los detalles de la nueva cita"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="grid gap-4 py-4 overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient_id">Mascota *</Label>
                  <Combobox
                    options={mascotas.map((mascota) => ({
                      value: mascota.id,
                      label: `${mascota.nombre} (${mascota.especie})`,
                    }))}
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                    placeholder="Buscar mascota..."
                    searchPlaceholder="Buscar por nombre..."
                    emptyMessage="No hay mascotas registradas"
                  />
                  <p className="text-xs text-muted-foreground">Selecciona la mascota para la cita</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="owner_id">Dueño</Label>
                  <Combobox
                    options={owners.map((owner) => ({
                      value: owner.id,
                      label: owner.name,
                    }))}
                    value={formData.owner_id}
                    onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
                    placeholder="Buscar dueño..."
                    searchPlaceholder="Buscar por nombre..."
                    emptyMessage="No hay dueños registrados"
                  />
                </div>
              </div>

              {/* Selector de Fecha */}
              <div className="grid gap-2">
                <Label>Fecha de la Cita</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => !isWeekday(date) || date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={es}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">Solo días laborables (Lunes a Viernes)</p>
              </div>

              {/* Selectores de Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_hour">Hora Inicio</Label>
                  <Select value={formData.start_hour} onValueChange={handleStartHourChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_HOURS.slice(0, -1).map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Horario: 8:00 - 21:00</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end_hour">Hora Fin</Label>
                  <Select
                    value={formData.end_hour}
                    onValueChange={(value) => setFormData({ ...formData, end_hour: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getEndHours(formData.start_hour).map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Intervalos de 30 minutos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Consulta</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta-general">Consulta General</SelectItem>
                      <SelectItem value="pulgas-garrapatas">Control de Pulgas/Garrapatas</SelectItem>
                      <SelectItem value="alergias">Alergias</SelectItem>
                      <SelectItem value="urgencias">Urgencias</SelectItem>
                      <SelectItem value="cytopoint">Cytopoint</SelectItem>
                      <SelectItem value="piel-pelos">Piel y Pelos</SelectItem>
                      <SelectItem value="otra">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="modalidad">Modalidad</Label>
                  <Select
                    value={formData.modalidad}
                    onValueChange={(value: any) => setFormData({ ...formData, modalidad: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Programada</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="rescheduled">Reprogramada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="veterinarian">Veterinario</Label>
                <Input
                  id="veterinarian"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 flex justify-between pt-4 border-t">
              {appointment && (
                <Button type="button" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{appointment ? "Guardar Cambios" : "Crear Cita"}</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás por eliminar la cita "{appointment?.title}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
