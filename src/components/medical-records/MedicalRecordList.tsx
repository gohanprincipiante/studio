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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';

interface MedicalRecordListProps {
  patientId: string;
  medicalRecordsPromise: Promise<MedicalRecord[]>;
}

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
    medicalRecordsPromise
      .then(data => {
        // Sort records by creation date, newest first
        const sortedData = data.sort((a,b) => {
            const dateAValue = a.createdAt ? (a.createdAt as any).toDate?.().getTime() || (a.createdAt as Date).getTime() : 0;
            const dateBValue = b.createdAt ? (b.createdAt as any).toDate?.().getTime() || (b.createdAt as Date).getTime() : 0;
            return dateBValue - dateAValue;
        });
        setMedicalRecords(sortedData);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to load medical records:", err);
        setError("Failed to load medical records. Please try again.");
        setMedicalRecords([]);
      })
      .finally(() => setIsLoading(false));
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
      title: "Medical Record Deleted",
      description: `Record for ${recordToDelete.currentIllness} has been removed.`,
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
      toast({ title: "Medical Record Updated", description: `Record for ${data.currentIllness} updated.` });
    } else { // Adding
      const newRecord: MedicalRecord = {
        ...data,
        id: String(Date.now()), // Mock ID
        patientId,
        examResults: newOrUpdatedExamResults,
        createdAt: new Date(),
      };
      setMedicalRecords([newRecord, ...medicalRecords]); // Add to top of list
      toast({ title: "Medical Record Added", description: `New record for ${data.currentIllness} added.` });
    }
    setIsFormOpen(false);
    setEditingRecord(null);
  };
  
  const getDisplayDate = (dateValue: Date | Timestamp | undefined): Date | null => {
    if (!dateValue) return null;
    if (typeof (dateValue as any).toDate === 'function') {
      return (dateValue as Timestamp).toDate();
    }
    return dateValue as Date;
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
          Add Medical Record
        </Button>
      </div>

      {medicalRecords.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No medical records found for this patient.</p>
      ) : (
        <div className="space-y-4">
          {medicalRecords.map(record => {
            const createdAtDate = getDisplayDate(record.createdAt);
            return (
              <Card key={record.id} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{record.currentIllness}</CardTitle>
                    {createdAtDate && (
                       <Badge variant="outline">{format(createdAtDate, 'PPP')}</Badge>
                    )}
                  </div>
                  {record.nextAppointmentDate && (
                    <CardDescription>
                      Next Appointment: <span className="font-semibold text-primary">{format(new Date(record.nextAppointmentDate + 'T00:00:00'), 'PPP')}</span>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Exam Results:</h4>
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
                              <a href={(result as ExamResultFile).fileUrl} target="_blank" rel="noopener noreferrer" title="View File">
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
                    ) : <p className="text-sm text-muted-foreground">No exam results recorded.</p>}
                  </div>
                   <div>
                    <h4 className="font-semibold text-foreground">Treatment:</h4>
                    <p className="text-sm text-muted-foreground">{record.treatment || 'N/A'}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setRecordToDelete(record)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Delete
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
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the medical record for "{recordToDelete.currentIllness}"? 
                This will also remove any associated files. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRecord} className="bg-destructive hover:bg-destructive/90">
                Delete Record
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default MedicalRecordList;
