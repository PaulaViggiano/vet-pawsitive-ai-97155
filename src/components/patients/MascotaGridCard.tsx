import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageCircle, 
  Edit, 
  Calendar,
  Heart,
  AlertCircle,
  Info,
  Trash2
} from 'lucide-react';
import { Mascota } from '@/hooks/useMascotas';

interface MascotaGridCardProps {
  mascota: Mascota;
  onViewHistory: (mascota: Mascota) => void;
  onWhatsApp: (mascota: Mascota) => void;
  onEdit: (mascota: Mascota) => void;
  onDelete: (mascota: Mascota) => void;
  onViewDetails?: (mascota: Mascota) => void;
  isHighlighted?: boolean;
}

export function MascotaGridCard({ 
  mascota, 
  onViewHistory, 
  onWhatsApp, 
  onEdit,
  onDelete,
  onViewDetails,
  isHighlighted = false
}: MascotaGridCardProps) {
  const navigate = useNavigate();
  const dueñoPrincipal = mascota.duenos?.find(d => d.es_principal) || mascota.duenos?.[0];
  
  const handleNavigateToOwner = (ownerId: string) => {
    navigate(`/duenos?highlight=${ownerId}`);
  };
  
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

  return (
    <Card className={`hover:shadow-lg transition-all ${
      isHighlighted ? 'ring-2 ring-primary shadow-lg' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{mascota.nombre}</h3>
            <p className="text-sm text-muted-foreground">
              {mascota.especie} {mascota.raza && `• ${mascota.raza}`}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{getEdad()}</span>
          </div>
          
          {dueñoPrincipal && (
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={() => handleNavigateToOwner(dueñoPrincipal.id)}
                className="text-primary hover:underline font-medium transition-colors"
              >
                {dueñoPrincipal.name}
              </button>
            </div>
          )}

          {(mascota.alergias && mascota.alergias.length > 0) && (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-destructive font-medium">Alergias:</p>
                <p className="text-muted-foreground">{mascota.alergias.join(', ')}</p>
              </div>
            </div>
          )}

          {(mascota.condiciones_cronicas && mascota.condiciones_cronicas.length > 0) && (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-orange-500 font-medium">Condiciones:</p>
                <p className="text-muted-foreground">{mascota.condiciones_cronicas.join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px]"
            onClick={() => onViewHistory(mascota)}
          >
            <FileText className="h-4 w-4 mr-1" />
            Historia
          </Button>
          
          {dueñoPrincipal?.phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px]"
              onClick={() => onWhatsApp(mascota)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
          )}
          
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(mascota)}
              title="Ver detalles completos"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(mascota)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(mascota)}
            className="hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
