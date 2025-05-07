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

interface PatientTableProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onView: (patientId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

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
    return <p className="text-center text-muted-foreground py-8">No patients found.</p>;
  }
  
  return (
    <div className="rounded-lg border overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Full Name</TableHead>
              <TableHead>National ID</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.fullName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{patient.nationalId}</Badge>
                </TableCell>
                <TableCell>{patient.dob ? format(new Date(patient.dob + 'T00:00:00'), "PPP") : 'N/A'}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onView(patient.id)} title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(patient)} title="Edit Patient">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(patient)} className="text-destructive hover:text-destructive/80" title="Delete Patient">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PatientTable;
