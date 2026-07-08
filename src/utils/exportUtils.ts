import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PatientReport, MedicalRecordReport, GeneralStats } from '../hooks/useReports';

// Logo base64 (placeholder - reemplazar con el logo real)
const LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDM4QzMwLjQ5MzQgMzggMzkgMjkuNDkzNCAzOSAyMEM0MCA5LjUwNjU5IDMwLjQ5MzQgMSAyMCAxQzkuNTA2NTkgMSAxIDkuNTA2NTkgMSAyMEMxIDMwLjQ5MzQgOS41MDY1OSAzOCAyMCAzOFoiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTIwIDI4QzI0LjQxODMgMjggMjggMjQuNDE4MyAyOCAyMEMyOCAxNS41ODE3IDI0LjQxODMgMTIgMjAgMTJDMTUuNTgxNyAxMiAxMiAxNS41ODE3IDEyIDIwQzEyIDI0LjQxODMgMTUuNTgxNyAyOCAyMCAyOFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';

interface ExportOptions {
  title: string;
  subtitle?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  reportType: 'mascotas' | 'duenos' | 'medical_records' | 'general';
}

export const exportToPDF = async (
  data: PatientReport[] | MedicalRecordReport[] | GeneralStats,
  options: ExportOptions
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header with logo and clinic info
  try {
    doc.addImage(LOGO_BASE64, 'PNG', 15, 15, 20, 20);
  } catch (error) {
    console.warn('Could not add logo to PDF:', error);
  }
  
  // Clinic information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(options.clinicName || 'Clínica Veterinaria PawsitiveAI', 45, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (options.clinicAddress) {
    doc.text(options.clinicAddress, 45, 32);
  }
  if (options.clinicPhone) {
    doc.text(`Tel: ${options.clinicPhone}`, 45, 37);
  }
  
  // Report title and date
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, pageWidth / 2, 55, { align: 'center' });
  
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, pageWidth / 2, 65, { align: 'center' });
  }
  
  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 75, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(15, 80, pageWidth - 15, 80);
  
  let startY = 90;
  
  // Generate content based on report type
  switch (options.reportType) {
    case 'general':
      generateGeneralStatsPDF(doc, data as GeneralStats, startY);
      break;
    case 'mascotas':
    case 'duenos':
      generatePatientsTablePDF(doc, data as PatientReport[], startY);
      break;
    case 'medical_records':
      generateMedicalRecordsTablePDF(doc, data as MedicalRecordReport[], startY);
      break;
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} - Generado por PawsitiveAI`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const fileName = `${options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

const generateGeneralStatsPDF = (doc: jsPDF, stats: GeneralStats, startY: number) => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estadísticas Generales', 15, startY);
  
  const statsData = [
    ['Total de Pacientes', stats.totalPatients.toString()],
    ['Historias Médicas', stats.totalMedicalRecords.toString()],
    ['Especies Diferentes', stats.speciesCount.toString()],
  ];
  
  autoTable(doc, {
    startY: startY + 10,
    head: [['Métrica', 'Valor']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });
};

const generatePatientsTablePDF = (doc: jsPDF, patients: PatientReport[], startY: number) => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Pacientes', 15, startY);
  
  const tableData = patients.map(patient => [
    patient.name,
    patient.species,
    patient.breed,
    patient.age?.toString() || 'N/A',
    patient.ownerName,
    patient.ownerPhone || 'N/A',
    patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-ES') : 'N/A'
  ]);
  
  autoTable(doc, {
    startY: startY + 10,
    head: [['Nombre', 'Especie', 'Raza', 'Edad', 'Propietario', 'Teléfono', 'Última Visita']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
    },
  });
};


const generateMedicalRecordsTablePDF = (doc: jsPDF, records: MedicalRecordReport[], startY: number) => {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Historias Médicas', 15, startY);
  
  const tableData = records.map(record => [
    new Date(record.date).toLocaleDateString('es-ES'),
    record.patientName,
    record.diagnosis,
    record.treatment,
    record.veterinarian || 'N/A',
    record.notes ? record.notes.substring(0, 50) + '...' : 'N/A'
  ]);
  
  autoTable(doc, {
    startY: startY + 10,
    head: [['Fecha', 'Paciente', 'Diagnóstico', 'Tratamiento', 'Veterinario', 'Notas']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 40 },
    },
  });
};

export const exportToCSV = (
  data: PatientReport[] | MedicalRecordReport[] | GeneralStats,
  options: ExportOptions
) => {
  let csvContent = '';
  let headers: string[] = [];
  let rows: string[][] = [];
  
  // Add header information
  csvContent += `${options.clinicName || 'Clínica Veterinaria PawsitiveAI'}\n`;
  if (options.clinicAddress) csvContent += `${options.clinicAddress}\n`;
  if (options.clinicPhone) csvContent += `Tel: ${options.clinicPhone}\n`;
  csvContent += `\n${options.title}\n`;
  if (options.subtitle) csvContent += `${options.subtitle}\n`;
  csvContent += `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}\n\n`;
  
  switch (options.reportType) {
    case 'general':
      const stats = data as GeneralStats;
      headers = ['Métrica', 'Valor'];
      rows = [
        ['Total de Pacientes', stats.totalPatients.toString()],
        ['Historias Médicas', stats.totalMedicalRecords.toString()],
        ['Especies Diferentes', stats.speciesCount.toString()],
      ];
      break;
      
    case 'mascotas':
    case 'duenos':
      const mascotas = data as PatientReport[];
      headers = ['Nombre', 'Especie', 'Raza', 'Edad', 'Estado', 'Última Visita'];
      rows = mascotas.map(mascota => [
        mascota.name,
        mascota.species,
        mascota.breed || 'N/A',
        mascota.age?.toString() || 'N/A',
        mascota.status,
        mascota.lastVisit ? new Date(mascota.lastVisit).toLocaleDateString('es-ES') : 'N/A'
      ]);
      break;
      
    case 'medical_records':
      const records = data as MedicalRecordReport[];
      headers = ['Fecha', 'Paciente', 'Diagnóstico', 'Tratamiento', 'Veterinario', 'Notas'];
      rows = records.map(record => [
        new Date(record.date).toLocaleDateString('es-ES'),
        record.patientName,
        record.diagnosis,
        record.treatment,
        record.veterinarian || 'N/A',
        record.notes || 'N/A'
      ]);
      break;
  }
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  rows.forEach(row => {
    const escapedRow = row.map(cell => {
      // Escape commas and quotes in CSV
      const cellStr = cell.toString();
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    });
    csvContent += escapedRow.join(',') + '\n';
  });
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};