import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Stethoscope,
  Thermometer,
  Heart,
  Wind
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  user_id: string;
  type: string;
  date: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  weight?: number;
  temperature?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  medications: string[];
  priority: 'baja' | 'media' | 'alta';
  status: 'activo' | 'completado' | 'cancelado';
  veterinarian: string;
  next_appointment?: string;
  created_at: string;
  updated_at: string;
  // Relación con paciente
  patient?: {
    name: string;
    owner_name: string;
    species: string;
  };
}

interface MedicalRecordListProps {
  records: MedicalRecord[];
  loading?: boolean;
  onView: (record: MedicalRecord) => void;
  onEdit: (record: MedicalRecord) => void;
  onDelete: (recordId: string) => void;
  onCreate?: () => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: { type?: string; priority?: string; status?: string }) => void;
}

export function MedicalRecordList({
  records,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onSearch,
  onFilterChange
}: MedicalRecordListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    type: 'all',
    priority: 'all',
    status: 'all'
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? '' : value };
    setFilters({ ...filters, [key]: value });
    onFilterChange?.(newFilters);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baja': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'default';
      case 'completado': return 'secondary';
      case 'cancelado': return 'destructive';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consulta': return <Stethoscope className="h-4 w-4" />;
      case 'vacunacion': return <FileText className="h-4 w-4" />;
      case 'cirugia': return <Heart className="h-4 w-4" />;
      case 'emergencia': return <Thermometer className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lista de registros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por diagnóstico, síntomas, tratamiento..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de consulta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="consulta">Consulta General</SelectItem>
                <SelectItem value="vacunacion">Vacunación</SelectItem>
                <SelectItem value="cirugia">Cirugía</SelectItem>
                <SelectItem value="emergencia">Emergencia</SelectItem>
                <SelectItem value="control">Control</SelectItem>
                <SelectItem value="diagnostico">Diagnóstico</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de registros */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No hay registros médicos
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || Object.values(filters).some(f => f !== 'all') 
                  ? 'No se encontraron registros con los filtros actuales.'
                  : 'Comienza creando el primer registro médico.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          records.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getTypeIcon(record.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold capitalize">{record.type}</h3>
                        <Badge variant={getPriorityColor(record.priority)}>
                          {record.priority}
                        </Badge>
                        <Badge variant={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(record.date), 'PPP', { locale: es })}
                        </span>
                        {record.patient && (
                          <span>
                            {record.patient.name} - {record.patient.owner_name}
                          </span>
                        )}
                        <span>{record.veterinarian}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(record)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(record.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Signos vitales */}
                {(record.weight || record.temperature || record.heart_rate || record.respiratory_rate) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                    {record.weight && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Peso:</span>
                        <span className="ml-1 font-medium">{record.weight} kg</span>
                      </div>
                    )}
                    {record.temperature && (
                      <div className="text-sm flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{record.temperature}°C</span>
                      </div>
                    )}
                    {record.heart_rate && (
                      <div className="text-sm flex items-center gap-1">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{record.heart_rate} bpm</span>
                      </div>
                    )}
                    {record.respiratory_rate && (
                      <div className="text-sm flex items-center gap-1">
                        <Wind className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{record.respiratory_rate} rpm</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Información clínica */}
                <div className="space-y-2">
                  {record.symptoms && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Síntomas:</span>
                      <p className="text-sm mt-1 line-clamp-2">{record.symptoms}</p>
                    </div>
                  )}
                  {record.diagnosis && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Diagnóstico:</span>
                      <p className="text-sm mt-1 line-clamp-2">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.medications.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Medicamentos:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.medications.slice(0, 3).map((med, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {med}
                          </Badge>
                        ))}
                        {record.medications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{record.medications.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}