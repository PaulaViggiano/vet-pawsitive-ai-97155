import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { MascotaGridCard } from './MascotaGridCard';
import { Mascota } from '@/hooks/useMascotas';
import { Skeleton } from '@/components/ui/skeleton';

interface MascotaGridProps {
  mascotas: Mascota[];
  isLoading: boolean;
  onCreateNew: () => void;
  onViewHistory: (mascota: Mascota) => void;
  onWhatsApp: (mascota: Mascota) => void;
  onEdit: (mascota: Mascota) => void;
  onDelete: (mascota: Mascota) => void;
  onViewDetails?: (mascota: Mascota) => void;
  highlightedId?: string;
}

export function MascotaGrid({
  mascotas,
  isLoading,
  onCreateNew,
  onViewHistory,
  onWhatsApp,
  onEdit,
  onDelete,
  onViewDetails,
  highlightedId,
}: MascotaGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecie, setFilterEspecie] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todos');

  const filteredMascotas = mascotas.filter(mascota => {
    const matchesSearch = mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mascota.duenos?.some(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEspecie = filterEspecie === 'todas' || mascota.especie === filterEspecie;
    const matchesEstado = filterEstado === 'todos' || mascota.estado === filterEstado;

    return matchesSearch && matchesEspecie && matchesEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mascotas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la información de tus pacientes
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Mascota
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre de mascota o dueño..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterEspecie} onValueChange={setFilterEspecie}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todas las especies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las especies</SelectItem>
            <SelectItem value="perro">Perro</SelectItem>
            <SelectItem value="gato">Gato</SelectItem>
            <SelectItem value="ave">Ave</SelectItem>
            <SelectItem value="conejo">Conejo</SelectItem>
            <SelectItem value="hamster">Hámster</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="inactivo">Inactivo</SelectItem>
            <SelectItem value="fallecido">Fallecido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de mascotas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredMascotas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchTerm || filterEspecie !== 'todas' || filterEstado !== 'todos'
              ? 'No se encontraron mascotas con los filtros aplicados'
              : 'No hay mascotas registradas. ¡Crea tu primera mascota!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMascotas.map(mascota => (
            <div key={mascota.id} id={`mascota-${mascota.id}`}>
              <MascotaGridCard
                mascota={mascota}
                onViewHistory={onViewHistory}
                onWhatsApp={onWhatsApp}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
                isHighlighted={highlightedId === mascota.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer con estadísticas */}
      {!isLoading && mascotas.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredMascotas.length} de {mascotas.length} mascotas
        </div>
      )}
    </div>
  );
}
