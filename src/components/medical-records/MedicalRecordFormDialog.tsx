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
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale'; // Import Spanish locale

const medicalRecordSchema = z.object({
  currentIllness: z.string().min(3, 'La descripción de la enfermedad actual debe tener al menos 3 caracteres'),
  examResultsText: z.string().optional(),
  examResultsFiles: z.custom<FileList | null>().nullable().optional(), // For file input
  treatment: z.string().min(3, 'El plan de tratamiento debe tener al menos 3 caracteres'),
  nextAppointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD").nullable().optional(),
}).refine(data => data.examResultsText || (data.examResultsFiles && data.examResultsFiles.length > 0), {
  message: "Se deben proporcionar resultados de examen en texto o archivos adjuntos.",
  path: ["examResultsText"], 
});


interface MedicalRecordFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicalRecordFormData, id?: string) => Promise<void>;
  defaultValues?: MedicalRecord | null;
  patientId: string; 
}

// Helper to parse YYYY-MM-DD string as local date or return undefined
const parseLocalDateStringToDate = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString) return undefined;
  // Try to parse as YYYY-MM-DD first
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  // Fallback for other date string formats or if already a Date object passed as string
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

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
      setSelectedFiles([]); 
      if (defaultValues) {
        const textResult = defaultValues.examResults.find(r => r.type === 'text') as ExamResultText | undefined;
        const fileResults = defaultValues.examResults.filter(r => r.type === 'file') as ExamResultFile[];
        setExistingFiles(fileResults);
        
        let formattedNextAppointmentDate: string | null = null;
        if (defaultValues.nextAppointmentDate) {
          const parsedDate = parseLocalDateStringToDate(defaultValues.nextAppointmentDate);
          if (parsedDate) {
            formattedNextAppointmentDate = format(parsedDate, 'yyyy-MM-dd');
          }
        }

        reset({
          currentIllness: defaultValues.currentIllness || '',
          examResultsText: textResult?.content || '',
          examResultsFiles: null, 
          treatment: defaultValues.treatment || '',
          nextAppointmentDate: formattedNextAppointmentDate,
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
      setValue('examResultsFiles', event.target.files, { shouldValidate: true });
    }
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setValue('examResultsFiles', dataTransfer.files.length > 0 ? dataTransfer.files : null, { shouldValidate: true });
  };
  

  const handleFormSubmit = async (data: MedicalRecordFormData) => {
    const submitData = {
        ...data,
    };
    await onSubmit(submitData, defaultValues?.id);
    if (!defaultValues?.id) { 
      reset();
      setSelectedFiles([]);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Historial Médico' : 'Añadir Nuevo Historial Médico'}</DialogTitle>
          <DialogDescription>
            {defaultValues ? 'Actualice los detalles de este historial médico.' : 'Complete la información médica del paciente.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-12rem)] pr-6"> 
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <div>
              <Label htmlFor="currentIllness">Enfermedad Actual / Motivo de Visita</Label>
              <Input id="currentIllness" {...register('currentIllness')} aria-invalid={errors.currentIllness ? "true" : "false"} />
              {errors.currentIllness && <p className="text-sm text-destructive mt-1">{errors.currentIllness.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="examResultsText">Resultados de Examen (Texto)</Label>
              <Textarea
                id="examResultsText"
                {...register('examResultsText')}
                placeholder="Ingrese resultados de examen textuales, observaciones, etc."
                rows={3}
              />
              {errors.examResultsText && <p className="text-sm text-destructive mt-1">{errors.examResultsText.message}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="examResultsFiles">Resultados de Examen (Archivos - PDF/JPG)</Label>
                <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor="examResultsFiles"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground">
                                <span className="font-semibold">Haga clic para cargar</span> o arrastre y suelte
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG (MÁX. 5MB cada uno)</p>
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
                 {errors.examResultsFiles && <p className="text-sm text-destructive mt-1">{errors.examResultsFiles.message as string}</p>}
                
                {existingFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Archivos existentes:</p>
                        {existingFiles.map((file, index) => (
                             <div key={`existing-${index}`} className="flex items-center justify-between p-1.5 bg-secondary rounded-md text-xs">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                    <span className="truncate" title={file.fileName}>{file.fileName}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Nuevos archivos para cargar:</p>
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
              <Label htmlFor="treatment">Plan de Tratamiento</Label>
              <Textarea id="treatment" {...register('treatment')} rows={3} aria-invalid={errors.treatment ? "true" : "false"} />
              {errors.treatment && <p className="text-sm text-destructive mt-1">{errors.treatment.message}</p>}
            </div>

            <div>
              <Label htmlFor="nextAppointmentDate">Próxima Cita (Opcional)</Label>
               <Controller
                name="nextAppointmentDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? parseLocalDateStringToDate(field.value) : undefined}
                    setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : null)}
                    placeholder="Seleccionar próxima cita"
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} 
                  />
                )}
              />
              {errors.nextAppointmentDate && <p className="text-sm text-destructive mt-1">{errors.nextAppointmentDate.message}</p>}
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (defaultValues ? 'Guardando...' : 'Añadiendo...') : (defaultValues ? 'Guardar Cambios' : 'Añadir Historial')}
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MedicalRecordFormDialog;
