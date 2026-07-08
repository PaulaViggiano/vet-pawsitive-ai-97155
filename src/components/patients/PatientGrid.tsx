import React, { useState } from 'react';
import { PatientGridCard } from './PatientGridCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter,
  Users,
  Heart,
  Calendar
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  owner_name: string;
  species: string;
  breed?: string;
  birth_date?: Date;
  status: 'activo' | 'inactivo' | 'fallecido';
  created_at: Date;
  phone?: string;
  email?: string;
  last_visit?: Date;
  gender?: string;
  color?: string;
  microchip?: string;
  address?: string;
  emergency_contact?: string;
  allergies?: string[];
  chronic_conditions?: string[];
}

interface PatientGridProps {
  patients: Patient[];
  isLoading: boolean;
  onCreateNew: () => void;
  onViewHistory: (patient: Patient) => void;
  onWhatsApp: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
}

export function PatientGrid({ 
  patients, 
  isLoading, 
  onCreateNew, 
  onViewHistory, 
  onWhatsApp, 
  onEdit 
}: PatientGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.species.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    const matchesSpecies = speciesFilter === 'all' || patient.species.toLowerCase() === speciesFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesSpecies;
  });

  // Get unique species for filter
  const uniqueSpecies = [...new Set(patients.map(p => p.species))];

  // Get stats
  const activePatients = patients.filter(p => p.status === 'activo').length;
  const totalPatients = patients.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-muted/50 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-muted/30 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted/50 rounded animate-pulse"></div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted/50 rounded mb-4"></div>
                <div className="h-4 bg-muted/30 rounded mb-2"></div>
                <div className="h-4 bg-muted/30 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-muted/50 rounded"></div>
                  <div className="h-8 bg-muted/50 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Gestión de Pacientes
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Administra la información de tus pacientes
          </p>
        </div>
        <Button 
          onClick={onCreateNew}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-0 shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
                <p className="text-3xl font-bold text-foreground">{totalPatients}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-3xl font-bold text-foreground">{activePatients}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                <p className="text-3xl font-bold text-foreground">
                  {patients.filter(p => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return p.created_at > monthAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-0 shadow-lg shadow-primary/5">
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
              placeholder="Buscar por nombre de paciente, propietario o especie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="fallecido">Fallecido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las especies</SelectItem>
                {uniqueSpecies.map((species) => (
                  <SelectItem key={species} value={species.toLowerCase()}>
                    {species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filters display */}
          {(searchQuery || statusFilter !== 'all' || speciesFilter !== 'all') && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Búsqueda: {searchQuery}
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Estado: {statusFilter}
                </Badge>
              )}
              {speciesFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Especie: {speciesFilter}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredPatients.length} de {totalPatients} pacientes
        </p>
      </div>

      {/* Patient Grid */}
      {filteredPatients.length === 0 ? (
        <Card className="bg-white border-0 shadow-lg shadow-primary/5">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {patients.length === 0 ? 'No hay pacientes registrados' : 'No se encontraron pacientes'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {patients.length === 0 
                ? 'Comienza agregando tu primer paciente' 
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
            {patients.length === 0 && (
              <Button onClick={onCreateNew} className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Paciente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PatientGridCard
              key={patient.id}
              patient={patient}
              onViewHistory={onViewHistory}
              onWhatsApp={onWhatsApp}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}