"use client";

import type { FC } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Patient, PatientFormData } from '@/types';
import PatientFormDialog from './PatientFormDialog';
import PatientTable from './PatientTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

// Mock data - replace with Firebase fetching
const initialPatients: Patient[] = [
  { id: '1', fullName: 'Alice Wonderland', age: 30, nationalId: 'ID123456', dob: '1994-01-15', address: '123 Fantasy Lane', phone: '555-0101', createdAt: new Date() },
  { id: '2', fullName: 'Bob The Builder', age: 45, nationalId: 'ID789012', dob: '1979-05-20', address: '456 Construction Rd', phone: '555-0202', createdAt: new Date() },
  { id: '3', fullName: 'Charlie Brown', age: 8, nationalId: 'ID345678', dob: '2016-07-30', address: '789 Comic Strip', phone: '555-0303', createdAt: new Date() },
];

const ITEMS_PER_PAGE = 10;

const PatientListClient: FC = () => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();
  const router = useRouter();

  // Replace with actual Firebase listener
  useEffect(() => {
    // Simulate fetching data or real-time listener
    // For now, use initialPatients
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  const handleAddPatient = () => {
    setEditingPatient(null);
    setIsFormOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    // Simulate API call
    setPatients(patients.filter(p => p.id !== patientToDelete.id));
    toast({
      title: "Patient Deleted",
      description: `${patientToDelete.fullName} has been removed.`,
      variant: "default",
    });
    setPatientToDelete(null);
  };

  const handleFormSubmit = async (data: PatientFormData, id?: string) => {
    // Simulate API call
    if (id) { // Editing
      setPatients(patients.map(p => p.id === id ? { ...p, ...data, id, updatedAt: new Date() } : p));
      toast({ title: "Patient Updated", description: `${data.fullName} has been updated.` });
    } else { // Adding
      const newPatient: Patient = { ...data, id: String(Date.now()), createdAt: new Date() };
      setPatients([newPatient, ...patients]);
      toast({ title: "Patient Added", description: `${data.fullName} has been registered.` });
    }
    setIsFormOpen(false);
    setEditingPatient(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddPatient} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Patient
        </Button>
      </div>

      <PatientTable
        patients={paginatedPatients}
        onEdit={handleEditPatient}
        onDelete={(patient) => setPatientToDelete(patient)}
        onView={handleViewPatient}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <PatientFormDialog
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingPatient(null); }}
        onSubmit={handleFormSubmit}
        defaultValues={editingPatient}
      />
      
      {patientToDelete && (
        <AlertDialog open={!!patientToDelete} onOpenChange={() => setPatientToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the patient record for {patientToDelete.fullName}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default PatientListClient;
