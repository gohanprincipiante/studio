"use client";

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MedicalRecord, MedicalRecordFormData, ExamResultText, ExamResultFile } from '@/types';
import { DatePicker } from '@/components/ui/datepicker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, UploadCloud, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const medicalRecordSchema = z.object({
  currentIllness: z.string().min(3, 'Current illness description must be at least 3 characters'),
  examResultsText: z.string().optional(),
  examResultsFiles: z.custom<FileList | null>().nullable().optional(), // For file input
  treatment: z.string().min(3, 'Treatment plan must be at least 3 characters'),
  nextAppointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").nullable().optional(),
}).refine(data => data.examResultsText || (data.examResultsFiles && data.examResultsFiles.length > 0), {
  message: "Either text results or file uploads must be provided for exam results.",
  path: ["examResultsText"], // You can point to one field or make it a general error
});


interface MedicalRecordFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicalRecordFormData, id?: string) => Promise<void>;
  defaultValues?: MedicalRecord | null;
  patientId: string; // To associate the record
}

const MedicalRecordFormDialog: FC<MedicalRecordFormDialogProps> = ({ isOpen, onClose, onSubmit, defaultValues, patientId }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExamResultFile[]>([]);


  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
  });
  
  const nextAppointmentDateForPicker = watch('nextAppointmentDate');

  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]); // Clear selected files when dialog opens
      if (defaultValues) {
        const textResult = defaultValues.examResults.find(r => r.type === 'text') as ExamResultText | undefined;
        const fileResults = defaultValues.examResults.filter(r => r.type === 'file') as ExamResultFile[];
        setExistingFiles(fileResults);

        reset({
          currentIllness: defaultValues.currentIllness || '',
          examResultsText: textResult?.content || '',
          examResultsFiles: null, // File input needs to be handled separately
          treatment: defaultValues.treatment || '',
          nextAppointmentDate: defaultValues.nextAppointmentDate ? defaultValues.nextAppointmentDate.split('T')[0] : null,
        });
      } else {
        setExistingFiles([]);
        reset({
          currentIllness: '',
          examResultsText: '',
          examResultsFiles: null,
          treatment: '',
          nextAppointmentDate: null,
        });
      }
    }
  }, [defaultValues, reset, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
      // Update react-hook-form value for files
      setValue('examResultsFiles', event.target.files, { shouldValidate: true });
    }
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    // Update react-hook-form by creating a new FileList
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setValue('examResultsFiles', dataTransfer.files.length > 0 ? dataTransfer.files : null, { shouldValidate: true });
  };
  
  // Note: Removing existing files would require a separate mechanism and state,
  // potentially marking them for deletion on submit. This example focuses on adding new files.

  const handleFormSubmit = async (data: MedicalRecordFormData) => {
     // Combine existing files (if any) with newly selected ones for submission logic
    // For this mock, we only pass new files. Real app would need to handle existing ones.
    const submitData = {
        ...data,
        // examResultsFiles: selectedFiles.length > 0 ? createFileObject(selectedFiles) : null,
        // If editing, `defaultValues.examResults` would need to be merged or handled
    };
    await onSubmit(submitData, defaultValues?.id);
    if (!defaultValues?.id) { // Only reset if adding new
      reset();
      setSelectedFiles([]);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Edit Medical Record' : 'Add New Medical Record'}</DialogTitle>
          <DialogDescription>
            {defaultValues ? 'Update the details of this medical record.' : 'Fill in the patient’s medical information.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-12rem)] pr-6"> {/* Adjust max-h as needed */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <div>
              <Label htmlFor="currentIllness">Current Illness / Reason for Visit</Label>
              <Input id="currentIllness" {...register('currentIllness')} aria-invalid={errors.currentIllness ? "true" : "false"} />
              {errors.currentIllness && <p className="text-sm text-destructive mt-1">{errors.currentIllness.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="examResultsText">Exam Results (Text)</Label>
              <Textarea
                id="examResultsText"
                {...register('examResultsText')}
                placeholder="Enter textual exam results, observations, etc."
                rows={3}
              />
              {errors.examResultsText && <p className="text-sm text-destructive mt-1">{errors.examResultsText.message}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="examResultsFiles">Exam Results (Files - PDF/JPG)</Label>
                <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor="examResultsFiles"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG (MAX. 5MB each)</p>
                        </div>
                        <Input 
                            id="examResultsFiles" 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange} 
                         />
                    </label>
                </div>
                 {errors.examResultsFiles && <p className="text-sm text-destructive mt-1">{errors.examResultsFiles.message}</p>}
                
                {existingFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Existing files:</p>
                        {existingFiles.map((file, index) => (
                             <div key={`existing-${index}`} className="flex items-center justify-between p-1.5 bg-secondary rounded-md text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate" title={file.fileName}>{file.fileName}</span>
                                </div>
                                {/* Deleting existing files needs careful backend handling (marking for deletion, etc.) */}
                                {/* <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => alert('Delete existing file not implemented')}>
                                    <XCircle className="h-4 w-4" />
                                </Button> */}
                            </div>
                        ))}
                    </div>
                )}

                {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">New files to upload:</p>
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-1.5 bg-secondary rounded-md text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate" title={file.name}>{file.name}</span> 
                                    <span className="text-muted-foreground/70 text-nowrap">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeSelectedFile(index)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
              <Label htmlFor="treatment">Treatment Plan</Label>
              <Textarea id="treatment" {...register('treatment')} rows={3} aria-invalid={errors.treatment ? "true" : "false"} />
              {errors.treatment && <p className="text-sm text-destructive mt-1">{errors.treatment.message}</p>}
            </div>

            <div>
              <Label htmlFor="nextAppointmentDate">Next Appointment Date (Optional)</Label>
               <Controller
                name="nextAppointmentDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                    setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                    placeholder="Select next appointment"
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                  />
                )}
              />
              {errors.nextAppointmentDate && <p className="text-sm text-destructive mt-1">{errors.nextAppointmentDate.message}</p>}
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (defaultValues ? 'Saving...' : 'Adding...') : (defaultValues ? 'Save Changes' : 'Add Record')}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalRecordFormDialog;
