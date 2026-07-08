// Servicio para manejar las operaciones CRUD de historia médica

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  type: 'consulta' | 'vacunacion' | 'cirugia' | 'emergencia' | 'revision' | 'control';
  veterinarian: string;
  weight: number;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medications: Medication[];
  notes: string;
  nextAppointment?: Date;
  attachments: string[];
  status: 'activo' | 'completado' | 'seguimiento';
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Patient {
  id: string;
  name: string;
  owner: string;
  species: string;
  breed: string;
  birthDate: Date;
  gender: 'macho' | 'hembra';
  color: string;
  microchip?: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  allergies: string[];
  chronicConditions: string[];
  lastVisit?: Date;
  status: 'activo' | 'inactivo';
}

// Datos de muestra para desarrollo
const sampleMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Max',
    date: new Date('2024-01-15'),
    type: 'consulta',
    veterinarian: 'Dra. Andrea Hernández',
    weight: 25.5,
    temperature: 38.2,
    heartRate: 90,
    respiratoryRate: 25,
    symptoms: 'Letargo, pérdida de apetito',
    diagnosis: 'Gastroenteritis leve',
    treatment: 'Dieta blanda, hidratación',
    medications: [
      {
        id: '1',
        name: 'Metronidazol',
        dosage: '250mg',
        frequency: 'Cada 12 horas',
        duration: '7 días',
        instructions: 'Administrar con comida'
      }
    ],
    notes: 'Paciente respondió bien al tratamiento. Recomendar seguimiento en 1 semana.',
    nextAppointment: new Date('2024-01-22'),
    attachments: [],
    status: 'completado',
    priority: 'media',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Luna',
    date: new Date('2024-01-10'),
    type: 'vacunacion',
    veterinarian: 'Dr. Miguel Santos',
    weight: 4.2,
    temperature: 38.5,
    heartRate: 120,
    respiratoryRate: 30,
    symptoms: 'Ninguno - vacunación preventiva',
    diagnosis: 'Paciente sano',
    treatment: 'Vacuna antirrábica',
    medications: [],
    notes: 'Vacunación anual completada. Próxima vacuna en enero 2025.',
    nextAppointment: new Date('2025-01-10'),
    attachments: [],
    status: 'completado',
    priority: 'media',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Rocky',
    date: new Date('2024-01-20'),
    type: 'cirugia',
    veterinarian: 'Dra. Carmen López',
    weight: 30.0,
    temperature: 38.0,
    heartRate: 85,
    respiratoryRate: 22,
    symptoms: 'Preparación para esterilización',
    diagnosis: 'Paciente apto para cirugía',
    treatment: 'Esterilización (castración)',
    medications: [
      {
        id: '2',
        name: 'Carprofeno',
        dosage: '50mg',
        frequency: 'Cada 24 horas',
        duration: '5 días',
        instructions: 'Administrar después de las comidas'
      },
      {
        id: '3',
        name: 'Amoxicilina',
        dosage: '500mg',
        frequency: 'Cada 12 horas',
        duration: '7 días',
        instructions: 'Completar todo el tratamiento'
      }
    ],
    notes: 'Cirugía exitosa. Mantener en reposo por 10 días. Revisar sutura en 7 días.',
    nextAppointment: new Date('2024-01-27'),
    attachments: [],
    status: 'seguimiento',
    priority: 'alta',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

const samplePatients: Patient[] = [
  {
    id: '1',
    name: 'Max',
    owner: 'Juan Pérez',
    species: 'Perro',
    breed: 'Golden Retriever',
    birthDate: new Date('2020-03-15'),
    gender: 'macho',
    color: 'Dorado',
    microchip: '123456789012345',
    phone: '+34 600 123 456',
    email: 'juan.perez@email.com',
    address: 'Calle Mayor 123, Madrid',
    emergencyContact: '+34 600 654 321',
    allergies: ['Pollo'],
    chronicConditions: [],
    lastVisit: new Date('2024-01-15'),
    status: 'activo'
  },
  {
    id: '2',
    name: 'Luna',
    owner: 'María García',
    species: 'Gato',
    breed: 'Siamés',
    birthDate: new Date('2021-07-22'),
    gender: 'hembra',
    color: 'Crema y marrón',
    phone: '+34 600 234 567',
    email: 'maria.garcia@email.com',
    allergies: [],
    chronicConditions: ['Asma felino'],
    lastVisit: new Date('2024-01-10'),
    status: 'activo'
  },
  {
    id: '3',
    name: 'Rocky',
    owner: 'Carlos López',
    species: 'Perro',
    breed: 'Pastor Alemán',
    birthDate: new Date('2019-11-08'),
    gender: 'macho',
    color: 'Negro y marrón',
    microchip: '987654321098765',
    phone: '+34 600 345 678',
    allergies: [],
    chronicConditions: ['Displasia de cadera'],
    lastVisit: new Date('2024-01-20'),
    status: 'activo'
  }
];

// Simulación de almacenamiento local
class MedicalRecordService {
  private records: MedicalRecord[] = [...sampleMedicalRecords];
  private patients: Patient[] = [...samplePatients];

  // Operaciones CRUD para registros médicos
  
  /**
   * Obtiene todos los registros médicos
   */
  getAllRecords(): MedicalRecord[] {
    return this.records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Obtiene registros médicos por ID de paciente
   */
  getRecordsByPatientId(patientId: string): MedicalRecord[] {
    return this.records
      .filter(record => record.patientId === patientId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Obtiene registros médicos por nombre de paciente (alias para compatibilidad)
   */
  getRecordsByPatient(patientName: string): MedicalRecord[] {
    return this.records
      .filter(record => record.patientName.toLowerCase().includes(patientName.toLowerCase()))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Obtiene pacientes (alias para compatibilidad)
   */
  getPatients(): Patient[] {
    return this.getAllPatients();
  }

  /**
   * Obtiene un registro médico por ID
   */
  getRecordById(id: string): MedicalRecord | undefined {
    return this.records.find(record => record.id === id);
  }

  /**
   * Crea un nuevo registro médico
   */
  createRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): MedicalRecord {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.records.push(newRecord);
    return newRecord;
  }

  /**
   * Actualiza un registro médico existente
   */
  updateRecord(id: string, updates: Partial<MedicalRecord>): MedicalRecord | null {
    const index = this.records.findIndex(record => record.id === id);
    if (index === -1) return null;

    this.records[index] = {
      ...this.records[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.records[index];
  }

  /**
   * Elimina un registro médico
   */
  deleteRecord(id: string): boolean {
    const index = this.records.findIndex(record => record.id === id);
    if (index === -1) return false;

    this.records.splice(index, 1);
    return true;
  }

  /**
   * Busca registros médicos por término
   */
  searchRecords(searchTerm: string): MedicalRecord[] {
    const term = searchTerm.toLowerCase();
    return this.records.filter(record => 
      record.patientName.toLowerCase().includes(term) ||
      record.diagnosis.toLowerCase().includes(term) ||
      record.symptoms.toLowerCase().includes(term) ||
      record.veterinarian.toLowerCase().includes(term)
    ).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Filtra registros por tipo
   */
  getRecordsByType(type: MedicalRecord['type']): MedicalRecord[] {
    return this.records
      .filter(record => record.type === type)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Filtra registros por estado
   */
  getRecordsByStatus(status: MedicalRecord['status']): MedicalRecord[] {
    return this.records
      .filter(record => record.status === status)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Obtiene estadísticas de registros médicos
   */
  getRecordStats() {
    const total = this.records.length;
    const byType = this.records.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = this.records.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthCount = this.records.filter(record => 
      record.date >= thisMonth
    ).length;

    return {
      total,
      byType,
      byStatus,
      thisMonth: thisMonthCount
    };
  }

  // Operaciones para pacientes
  
  /**
   * Obtiene todos los pacientes
   */
  getAllPatients(): Patient[] {
    return this.patients.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtiene un paciente por ID
   */
  getPatientById(id: string): Patient | undefined {
    return this.patients.find(patient => patient.id === id);
  }

  /**
   * Busca pacientes por término
   */
  searchPatients(searchTerm: string): Patient[] {
    const term = searchTerm.toLowerCase();
    return this.patients.filter(patient => 
      patient.name.toLowerCase().includes(term) ||
      patient.owner.toLowerCase().includes(term) ||
      patient.species.toLowerCase().includes(term) ||
      patient.breed.toLowerCase().includes(term)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Obtiene el historial completo de un paciente
   */
  getPatientHistory(patientId: string): {
    patient: Patient | undefined;
    records: MedicalRecord[];
    stats: {
      totalVisits: number;
      lastVisit: Date | null;
      commonDiagnoses: string[];
      medications: string[];
    };
  } {
    const patient = this.getPatientById(patientId);
    const records = this.getRecordsByPatientId(patientId);
    
    const diagnoses = records.map(r => r.diagnosis);
    const medications = records.flatMap(r => r.medications.map(m => m.name));
    
    return {
      patient,
      records,
      stats: {
        totalVisits: records.length,
        lastVisit: records.length > 0 ? records[0].date : null,
        commonDiagnoses: [...new Set(diagnoses)],
        medications: [...new Set(medications)]
      }
    };
  }

  // Métodos de utilidad para colores y etiquetas
  getTypeColor(type: MedicalRecord['type']): string {
    switch (type) {
      case 'consulta': return 'bg-blue-100 text-blue-800';
      case 'vacunacion': return 'bg-green-100 text-green-800';
      case 'cirugia': return 'bg-purple-100 text-purple-800';
      case 'emergencia': return 'bg-red-100 text-red-800';
      case 'revision': return 'bg-yellow-100 text-yellow-800';
      case 'control': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeLabel(type: MedicalRecord['type']): string {
    switch (type) {
      case 'consulta': return 'Consulta';
      case 'vacunacion': return 'Vacunación';
      case 'cirugia': return 'Cirugía';
      case 'emergencia': return 'Emergencia';
      case 'revision': return 'Revisión';
      case 'control': return 'Control';
      default: return 'Desconocido';
    }
  }

  getStatusColor(status: MedicalRecord['status']): string {
    switch (status) {
      case 'activo': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'seguimiento': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: MedicalRecord['status']): string {
    switch (status) {
      case 'activo': return 'Activo';
      case 'completado': return 'Completado';
      case 'seguimiento': return 'Seguimiento';
      default: return 'Desconocido';
    }
  }

  getPriorityColor(priority: MedicalRecord['priority']): string {
    switch (priority) {
      case 'baja': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-blue-100 text-blue-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}

// Instancia singleton del servicio
export const medicalRecordService = new MedicalRecordService();

// Funciones de utilidad
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateAge = (birthDate: Date): string => {
  const today = new Date();
  const years = today.getFullYear() - birthDate.getFullYear();
  const months = today.getMonth() - birthDate.getMonth();
  
  if (years > 0) {
    return `${years} año${years > 1 ? 's' : ''}`;
  } else {
    return `${months} mes${months > 1 ? 'es' : ''}`;
  }
};

// Re-export utility functions for external use
export const getStatusColor = (status: MedicalRecord['status']): string => {
  return medicalRecordService.getStatusColor(status);
};

export const getPriorityColor = (priority: MedicalRecord['priority']): string => {
  return medicalRecordService.getPriorityColor(priority);
};

export const getTypeColor = (type: MedicalRecord['type']): string => {
  return medicalRecordService.getTypeColor(type);
};

export const getTypeLabel = (type: MedicalRecord['type']): string => {
  return medicalRecordService.getTypeLabel(type);
};

export const getStatusLabel = (status: MedicalRecord['status']): string => {
  return medicalRecordService.getStatusLabel(status);
};