
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Timestamp } from 'firebase/firestore';
import { MedicalRecord, MedicalRecordFormData, ExamResultFile } from '@/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, FileText, Download, ExternalLink } from 'lucide-react';
import MedicalRecordFormDialog from './MedicalRecordFormDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Import Spanish locale
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';

interface MedicalRecordListProps {
  patientId: string;
  medicalRecordsPromise: Promise<MedicalRecord[]>;
}

// Helper to parse YYYY-MM-DD string as local date
const parseLocalDate = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const date = new Date(dateString); // Fallback for other formats or if already a Date-like string
  return isNaN(date.getTime()) ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const MedicalRecordList: FC<MedicalRecordListProps> = ({ patientId, medicalRecordsPromise }) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setError(null); // Reset error at the beginning
    setMedicalRecords([]); // Clear previous records

    if (medicalRecordsPromise && typeof medicalRecordsPromise.then === 'function') {
      const promiseToProcess = Promise.resolve(medicalRecordsPromise);

      promiseToProcess
        .then(data => {
          if (Array.isArray(data)) {
            const sortedData = data.sort((a, b) => {
              const dateAValue = getDisplayDate(a.createdAt)?.getTime() || 0;
              const dateBValue = getDisplayDate(b.createdAt)?.getTime() || 0;
              return dateBValue - dateAValue;
            });
            setMedicalRecords(sortedData);
            // setError(null); // Already null from the start of useEffect
          } else {
            // This case implies data is not an array as expected
            console.error("Error al cargar historial médico: los datos recibidos no son un array.", data);
            setError("Error al cargar historial médico: formato de datos inesperado.");
            // setMedicalRecords([]); // Already cleared
          }
        })
        .catch(err => {
          console.error("Error al cargar historial médico (en .catch):", err);
          setError("Error al cargar historial médico. Por favor, intente de nuevo.");
          // setMedicalRecords([]); // Already cleared
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // medicalRecordsPromise is not a valid promise-like object
      if (!medicalRecordsPromise) {
          setError("No se proporcionaron datos del historial médico para cargar (promesa nula o indefinida).");
      } else {
          setError("Referencia de datos del historial médico no válida (no es una promesa).");
          console.error("medicalRecordsPromise no es un objeto 'thenable' válido:", medicalRecordsPromise);
      }
      setIsLoading(false);
      // setMedicalRecords([]); // Already cleared
    }
  }, [medicalRecordsPromise, patientId]);


  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    // Simulate API call for deletion
    setMedicalRecords(medicalRecords.filter(r => r.id !== recordToDelete.id));
    // TODO: Actual Firebase delete call, including deleting files from Storage
    toast({
      title: "Historial Médico Eliminado",
      description: `El historial para ${recordToDelete.currentIllness} ha sido eliminado.`,
    });
    setRecordToDelete(null);
  };

  const handleFormSubmit = async (data: MedicalRecordFormData, id?: string) => {
    // Simulate API call (add/update)
    // TODO: Implement actual Firebase add/update, including file uploads to Storage
    // For file uploads, you'd use Firebase Storage SDK here.
    // The `data.examResultsFiles` would contain the FileList.
    // For now, we'll just mock the examResults structure if files are present.
    
    let newOrUpdatedExamResults: MedicalRecord['examResults'] = [];
    if (data.examResultsText) {
      newOrUpdatedExamResults.push({ type: 'text', content: data.examResultsText });
    }
    if (data.examResultsFiles && data.examResultsFiles.length > 0) {
        for (let i = 0; i < data.examResultsFiles.length; i++) {
            const file = data.examResultsFiles[i];
            newOrUpdatedExamResults.push({
                type: 'file',
                fileName: file.name,
                fileUrl: URL.createObjectURL(file), // Temporary local URL for display
                fileRefPath: `patients/${patientId}/medical_records/${id || Date.now()}/${file.name}`, // Mock path
                contentType: file.type,
            });
        }
    }


    if (id) { // Editing
      setMedicalRecords(
        medicalRecords.map(r => (r.id === id ? { ...r, ...data, patientId, examResults: newOrUpdatedExamResults, id, updatedAt: new Date() } : r))
      );
      toast({ title: "Historial Médico Actualizado", description: `El historial para ${data.currentIllness} ha sido actualizado.` });
    } else { // Adding
      const newRecord: MedicalRecord = {
        ...data,
        id: String(Date.now()), // Mock ID
        patientId,
        examResults: newOrUpdatedExamResults,
        createdAt: new Date(),
      };
      setMedicalRecords([newRecord, ...medicalRecords]); // Add to top of list
      toast({ title: "Historial Médico Añadido", description: `Nuevo historial para ${data.currentIllness} añadido.` });
    }
    setIsFormOpen(false);
    setEditingRecord(null);
  };
  
  const getDisplayDate = (dateValue: Date | Timestamp | string | undefined): Date | null => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string') {
        // Assuming ISO string or a format Date constructor can handle
        const d = new Date(dateValue);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof (dateValue as any).toDate === 'function') { // Firebase Timestamp
      return (dateValue as Timestamp).toDate();
    }
    return dateValue instanceof Date ? dateValue : null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-right">
          <Skeleton className="h-10 w-48" />
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-end gap-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
     return <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-right">
        <Button onClick={handleAddRecord}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Añadir Historial Médico
        </Button>
      </div>

      {medicalRecords.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No se encontraron historiales médicos para este paciente.</p>
      ) : (
        <div className="space-y-4">
          {medicalRecords.map(record => {
            const createdAtDate = getDisplayDate(record.createdAt);
            const nextAppointmentParsedDate = parseLocalDate(record.nextAppointmentDate);
            return (
              <Card key={record.id} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{record.currentIllness}</CardTitle>
                    {createdAtDate && (
                       <Badge variant="outline">{format(createdAtDate, 'PPP', { locale: es })}</Badge>
                    )}
                  </div>
                  {nextAppointmentParsedDate && (
                    <CardDescription>
                      Próxima Cita: <span className="font-semibold text-primary">{format(nextAppointmentParsedDate, 'PPP', { locale: es })}</span>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Resultados de Examen:</h4>
                    {record.examResults && record.examResults.length > 0 ? (
                      <ul className="list-disc list-inside pl-4 text-sm space-y-1 mt-1">
                      {record.examResults.map((result, index) => (
                        <li key={index}>
                          {result.type === 'text' ? (
                            <p className="text-muted-foreground">{result.content}</p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-muted-foreground">{result.fileName} ({result.contentType})</span>
                              {/* In a real app, fileUrl would point to Firebase Storage */}
                              <a href={(result as ExamResultFile).fileUrl} target="_blank" rel="noopener noreferrer" title="Ver Archivo">
                                 <ExternalLink className="h-4 w-4 text-blue-500 hover:underline" />
                              </a>
                               {/* <Button variant="ghost" size="sm" onClick={() => alert('Download not implemented. URL: ' + (result as ExamResultFile).fileUrl)}>
                                  <Download className="h-4 w-4 mr-1" /> Download
                              </Button> */}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    ) : <p className="text-sm text-muted-foreground">No se registraron resultados de examen.</p>}
                  </div>
                   <div>
                    <h4 className="font-semibold text-foreground">Tratamiento:</h4>
                    <p className="text-sm text-muted-foreground">{record.treatment || 'N/A'}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                    <Edit className="mr-1 h-4 w-4" /> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setRecordToDelete(record)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <MedicalRecordFormDialog
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingRecord(null); }}
        onSubmit={handleFormSubmit}
        defaultValues={editingRecord}
        patientId={patientId}
      />

      {recordToDelete && (
        <AlertDialog open={!!recordToDelete} onOpenChange={() => setRecordToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de que desea eliminar el historial médico para "{recordToDelete.currentIllness}"? 
                Esto también eliminará cualquier archivo asociado. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRecord} className="bg-destructive hover:bg-destructive/90">
                Eliminar Historial
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default MedicalRecordList;
