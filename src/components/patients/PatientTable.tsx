"use client";
import type { FC } from 'react';
import { Patient } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns'; // For formatting dates
import { es } from 'date-fns/locale'; // Import Spanish locale

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onView: (patientId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Helper to parse YYYY-MM-DD string as local date to avoid timezone issues
// that can lead to hydration mismatches if server and client are in different timezones.
const parseLocalDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  // Fallback for other date string formats, though YYYY-MM-DD is expected for DOB
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


const PatientTable: FC<PatientTableProps> = ({ patients, onEdit, onDelete, onView, currentPage, totalPages, onPageChange }) => {
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (patients.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No se encontraron pacientes.</p>;
  }
  
  return (
    <div className="rounded-lg border overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nombre Completo</TableHead>
              <TableHead>DNI / ID Nacional</TableHead>
              <TableHead>Fecha de Nacimiento</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right w-[200px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const dobDate = parseLocalDate(patient.dob);
              return (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{patient.nationalId}</Badge>
                  </TableCell>
                  <TableCell>{dobDate ? format(dobDate, "PPP", { locale: es }) : 'N/A'}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onView(patient.id)} title="Ver Detalles">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(patient)} title="Editar Paciente">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(patient)} className="text-destructive hover:text-destructive/80" title="Eliminar Paciente">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientTable;
