import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/ui/card-custom';
import { ActionButton } from '@/components/ui/button-custom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { useReports, ReportFilters, PatientReport, MedicalRecordReport, GeneralStats } from '@/hooks/useReports';
import { useMascotas } from '@/hooks/useMascotas';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  Heart,
  Download,
  Filter,
  Eye,
  FileText,
  Activity,
  Stethoscope,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { exportToPDF, exportToCSV } from '../utils/exportUtils';

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState<'mascotas' | 'duenos' | 'medical_records' | 'general'>('general');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  
  // Data states
  const [mascotaReports, setMascotaReports] = useState<PatientReport[]>([]);
  const [medicalRecordReports, setMedicalRecordReports] = useState<MedicalRecordReport[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  
  const { 
    loading, 
    error, 
    generatePatientReport, 
    generateMedicalRecordReport, 
    generateGeneralStats 
  } = useReports();
  
  const { mascotas } = useMascotas();

  // Load initial data
  useEffect(() => {
    loadReportData();
  }, [selectedReport]);

  const loadReportData = async () => {
    try {
      const currentFilters: ReportFilters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        patientId: selectedPatient && selectedPatient !== 'all' ? selectedPatient : undefined,
        species: selectedSpecies && selectedSpecies !== 'all' ? selectedSpecies : undefined,
        reportType: selectedReport,
      };

      switch (selectedReport) {
        case 'mascotas':
          const mascotaData = await generatePatientReport(currentFilters);
          setMascotaReports(mascotaData);
          break;
        case 'duenos':
          // For now, show mascotas data - you can extend this later
          const duenosData = await generatePatientReport(currentFilters);
          setMascotaReports(duenosData);
          break;
        case 'medical_records':
          const medicalData = await generateMedicalRecordReport(currentFilters);
          setMedicalRecordReports(medicalData);
          break;
        case 'general':
          const statsData = await generateGeneralStats(currentFilters);
          setGeneralStats(statsData);
          break;
      }
    } catch (err) {
      toast.error('Error al cargar los datos del reporte');
      console.error('Error loading report data:', err);
    }
  };

  const handleFilterChange = () => {
    loadReportData();
  };

  const handleExportReport = async (format: 'pdf' | 'csv') => {
    try {
      let data: PatientReport[] | MedicalRecordReport[] | GeneralStats;
      let title = '';
      
      // Get current data based on selected report
      switch (selectedReport) {
        case 'mascotas':
          data = mascotaReports;
          title = 'Reporte de Mascotas';
          break;
        case 'duenos':
          data = mascotaReports;
          title = 'Reporte de Dueños';
          break;
        case 'medical_records':
          data = medicalRecordReports;
          title = 'Reporte de Historias Médicas';
          break;
        case 'general':
          data = generalStats!;
          title = 'Reporte General';
          break;
        default:
          toast.error('Tipo de reporte no válido');
          return;
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast.error('No hay datos para exportar');
        return;
      }

      const exportOptions = {
        title,
        subtitle: `Período: ${startDate || 'Inicio'} - ${endDate || 'Fin'}`,
        clinicName: 'Clínica Veterinaria PawsitiveAI',
        clinicAddress: 'Av. Principal 123, Ciudad',
        clinicPhone: '+1 (555) 123-4567',
        reportType: selectedReport,
      };

      if (format === 'pdf') {
        await exportToPDF(data, exportOptions);
        toast.success('Reporte PDF generado exitosamente');
      } else {
        exportToCSV(data, exportOptions);
        toast.success('Reporte CSV generado exitosamente');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(`Error al exportar el reporte en formato ${format.toUpperCase()}`);
    }
  };

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'mascotas': return 'Reporte de Mascotas';
      case 'duenos': return 'Reporte de Dueños';
      case 'medical_records': return 'Reporte de Historias Médicas';
      case 'general': return 'Reporte General';
      default: return 'Reportes y Estadísticas';
    }
  };

  const getReportIcon = () => {
    switch (selectedReport) {
      case 'mascotas': return Heart;
      case 'duenos': return Users;
      case 'medical_records': return Stethoscope;
      case 'general': return BarChart3;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">
            Análisis detallado del rendimiento de tu clínica veterinaria
          </p>
        </div>
        <div className="flex gap-3">
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => handleExportReport('pdf')}
            disabled={loading || (!mascotaReports.length && !medicalRecordReports.length && !generalStats)}
          >
            Exportar PDF
          </ActionButton>
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => handleExportReport('csv')}
            disabled={loading || (!mascotaReports.length && !medicalRecordReports.length && !generalStats)}
          >
            Exportar CSV
          </ActionButton>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Reporte</label>
            <Select value={selectedReport} onValueChange={(value: any) => setSelectedReport(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="mascotas">Mascotas</SelectItem>
                <SelectItem value="duenos">Dueños</SelectItem>
                <SelectItem value="medical_records">Historias Médicas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fecha Inicio</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fecha Fin</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Patient Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Mascota</label>
            <Combobox
              options={[
                { value: 'all', label: 'Todas las mascotas' },
                ...mascotas.map(m => ({ value: m.id, label: m.nombre }))
              ]}
              value={selectedPatient}
              onValueChange={setSelectedPatient}
              placeholder="Buscar mascota..."
            />
          </div>

          {/* Species Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Especie</label>
            <Combobox
              options={[
                { value: 'all', label: 'Todas las especies' },
                { value: 'perro', label: 'Perro' },
                { value: 'gato', label: 'Gato' },
                { value: 'otros', label: 'Otros' }
              ]}
              value={selectedSpecies}
              onValueChange={setSelectedSpecies}
              placeholder="Buscar especie..."
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleFilterChange} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-700">
            <Activity className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Cargando datos del reporte...</p>
          </div>
        </Card>
      )}

      {/* Report Content */}
      {!loading && !error && (
        <>
          {/* General Stats */}
          {selectedReport === 'general' && generalStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                    <p className="text-2xl font-bold text-gray-900">{generalStats.totalPatients}</p>
                  </div>
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Historias Médicas</p>
                    <p className="text-2xl font-bold text-gray-900">{generalStats.totalMedicalRecords}</p>
                  </div>
                  <Stethoscope className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Especies Diferentes</p>
                    <p className="text-2xl font-bold text-gray-900">{generalStats.speciesCount}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </Card>
            </div>
          )}

          {/* Mascota Reports */}
          {(selectedReport === 'mascotas' || selectedReport === 'duenos') && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedReport === 'mascotas' ? 'Reporte de Mascotas' : 'Reporte de Dueños'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nombre</th>
                      <th className="text-left p-2">Especie</th>
                      <th className="text-left p-2">Raza</th>
                      <th className="text-left p-2">Edad</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Última Visita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mascotaReports.map((mascota) => (
                      <tr key={mascota.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{mascota.name}</td>
                        <td className="p-2">{mascota.species}</td>
                        <td className="p-2">{mascota.breed || 'N/A'}</td>
                        <td className="p-2">{mascota.age ? `${mascota.age} años` : 'N/A'}</td>
                        <td className="p-2">{mascota.status}</td>
                        <td className="p-2">{mascota.lastVisit ? new Date(mascota.lastVisit).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mascotaReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron mascotas con los filtros aplicados
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Medical Records Reports */}
          {selectedReport === 'medical_records' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reporte de Historias Médicas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Fecha</th>
                      <th className="text-left p-2">Paciente</th>
                      <th className="text-left p-2">Diagnóstico</th>
                      <th className="text-left p-2">Tratamiento</th>
                      <th className="text-left p-2">Veterinario</th>
                      <th className="text-left p-2">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalRecordReports.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="p-2 font-medium">{record.patientName}</td>
                        <td className="p-2">{record.diagnosis}</td>
                        <td className="p-2">{record.treatment}</td>
                        <td className="p-2">{record.veterinarian}</td>
                        <td className="p-2 max-w-xs truncate" title={record.notes}>
                          {record.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {medicalRecordReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron historias médicas con los filtros aplicados
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}