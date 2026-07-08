import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle,
  Syringe,
  User,
  Info
} from 'lucide-react';
import { Mascota } from '@/hooks/useMascotas';

interface MascotaDetailDialogProps {
  mascota: Mascota | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MascotaDetailDialog({ mascota, open, onOpenChange }: MascotaDetailDialogProps) {
  if (!mascota) return null;

  const getEdad = () => {
    if (!mascota.fecha_nacimiento) return 'Edad desconocida';
    const hoy = new Date();
    const nacimiento = new Date(mascota.fecha_nacimiento);
    const años = hoy.getFullYear() - nacimiento.getFullYear();
    const meses = hoy.getMonth() - nacimiento.getMonth();
    
    if (años === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    return `${años} ${años === 1 ? 'año' : 'años'}`;
  };

  const getStatusBadge = () => {
    const variants = {
      activo: 'default' as const,
      inactivo: 'secondary' as const,
      fallecido: 'destructive' as const,
    };
    return (
      <Badge variant={variants[mascota.estado]}>
        {mascota.estado.charAt(0).toUpperCase() + mascota.estado.slice(1)}
      </Badge>
    );
  };

  const dueñoPrincipal = mascota.duenos?.find(d => d.es_principal);
  const otrosDueños = mascota.duenos?.filter(d => !d.es_principal) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Ficha de {mascota.nombre}</DialogTitle>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la Mascota */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              Información de la Mascota
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Especie</p>
                <p className="font-medium capitalize">{mascota.especie}</p>
              </div>
              {mascota.raza && (
                <div>
                  <p className="text-sm text-muted-foreground">Raza</p>
                  <p className="font-medium">{mascota.raza}</p>
                </div>
              )}
              {mascota.genero && (
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium capitalize">{mascota.genero}</p>
                </div>
              )}
              {mascota.color && (
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{mascota.color}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Edad</p>
                <p className="font-medium">{getEdad()}</p>
              </div>
              {mascota.microchip && (
                <div>
                  <p className="text-sm text-muted-foreground">Microchip</p>
                  <p className="font-medium">{mascota.microchip}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Dueño Principal */}
          {dueñoPrincipal && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Dueño Principal
              </h3>
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{dueñoPrincipal.name}</span>
                  {dueñoPrincipal.relationship && (
                    <Badge variant="outline">{dueñoPrincipal.relationship}</Badge>
                  )}
                </div>
                {dueñoPrincipal.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{dueñoPrincipal.phone}</span>
                  </div>
                )}
                {dueñoPrincipal.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{dueñoPrincipal.email}</span>
                  </div>
                )}
                {dueñoPrincipal.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{dueñoPrincipal.address}</span>
                  </div>
                )}
                {dueñoPrincipal.emergency_contact && (
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span>Contacto de emergencia: {dueñoPrincipal.emergency_contact}</span>
                  </div>
                )}
                {dueñoPrincipal.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Notas:</p>
                    <p className="text-sm">{dueñoPrincipal.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Otros Dueños */}
          {otrosDueños.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Otros Dueños
              </h3>
              <div className="space-y-3">
                {otrosDueños.map((dueno, index) => (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dueno.name}</span>
                      {dueno.relationship && (
                        <Badge variant="outline">{dueno.relationship}</Badge>
                      )}
                    </div>
                    {dueno.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{dueno.phone}</span>
                      </div>
                    )}
                    {dueno.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{dueno.email}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Información Médica */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Syringe className="h-5 w-5 text-purple-600" />
              Información Médica
            </h3>
            <div className="space-y-3">
              {mascota.alergias && mascota.alergias.length > 0 && (
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-destructive">Alergias</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mascota.alergias.map((alergia, index) => (
                      <Badge key={index} variant="destructive">{alergia}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {mascota.condiciones_cronicas && mascota.condiciones_cronicas.length > 0 && (
                <div className="bg-orange-500/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-500">Condiciones Crónicas</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mascota.condiciones_cronicas.map((condicion, index) => (
                      <Badge key={index} variant="outline" className="border-orange-500 text-orange-500">
                        {condicion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(!mascota.alergias || mascota.alergias.length === 0) && 
               (!mascota.condiciones_cronicas || mascota.condiciones_cronicas.length === 0) && (
                <div className="bg-muted/30 p-4 rounded-lg text-center text-muted-foreground">
                  No hay alergias ni condiciones crónicas registradas
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {mascota.notas && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Notas Adicionales</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm">{mascota.notas}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
