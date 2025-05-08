"use client";

import type { FC } from 'react';
import { useEffect } from 'react';
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
import { Patient, PatientFormData } from '@/types';
import { DatePicker } from '@/components/ui/datepicker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale'; // Import Spanish locale

const patientSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  nationalId: z.string().min(5, 'El DNI/ID nacional debe tener al menos 5 caracteres'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de nacimiento debe estar en formato YYYY-MM-DD"),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  phone: z.string().min(7, 'El número de teléfono debe tener al menos 7 dígitos').regex(/^\+?[0-9\s-()]+$/, 'Formato de número de teléfono inválido'),
});


interface PatientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData, id?: string) => Promise<void>;
  defaultValues?: Patient | null;
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


const PatientFormDialog: FC<PatientFormDialogProps> = ({ isOpen, onClose, onSubmit, defaultValues }) => {
  const currentYear = new Date().getFullYear();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      dob: defaultValues.dob ? format(parseLocalDateStringToDate(defaultValues.dob) || new Date(), 'yyyy-MM-dd') : '', // Ensure YYYY-MM-DD
    } : {
      fullName: '',
      nationalId: '',
      dob: '',
      address: '',
      phone: '',
    },
  });

  const dobForDatePicker = watch('dob');

  useEffect(() => {
    if (isOpen) { // Only reset form when dialog opens or defaultValues change while open
      if (defaultValues) {
        const parsedDob = parseLocalDateStringToDate(defaultValues.dob);
        reset({
          ...defaultValues,
          dob: parsedDob ? format(parsedDob, 'yyyy-MM-dd') : '', 
        });
      } else {
        reset({
          fullName: '',
          nationalId: '',
          dob: '',
          address: '',
          phone: '',
        });
      }
    }
  }, [defaultValues, reset, isOpen]);

  const handleFormSubmit = async (data: PatientFormData) => {
    await onSubmit(data, defaultValues?.id);
    if (!defaultValues?.id) { // Only reset if adding new, not editing
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Paciente' : 'Añadir Nuevo Paciente'}</DialogTitle>
          <DialogDescription>
            {defaultValues ? 'Actualice los datos del paciente a continuación.' : 'Complete los datos del nuevo paciente.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-10rem)] pr-6"> {/* Adjust max-h as needed */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input id="fullName" {...register('fullName')} aria-invalid={errors.fullName ? "true" : "false"} />
            {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <Label htmlFor="nationalId">DNI / ID Nacional</Label>
            <Input id="nationalId" {...register('nationalId')} aria-invalid={errors.nationalId ? "true" : "false"} />
            {errors.nationalId && <p className="text-sm text-destructive mt-1">{errors.nationalId.message}</p>}
          </div>

          <div>
            <Label htmlFor="dob">Fecha de Nacimiento</Label>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                 <DatePicker
                  date={field.value ? parseLocalDateStringToDate(field.value) : undefined} 
                  setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholder="Seleccionar fecha de nacimiento"
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={currentYear}
                />
              )}
            />
            {errors.dob && <p className="text-sm text-destructive mt-1">{errors.dob.message}</p>}
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...register('address')} aria-invalid={errors.address ? "true" : "false"} />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Número de Teléfono</Label>
            <Input id="phone" type="tel" {...register('phone')} aria-invalid={errors.phone ? "true" : "false"} />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (defaultValues ? 'Guardando...' : 'Añadiendo...') : (defaultValues ? 'Guardar Cambios' : 'Añadir Paciente')}
            </Button>
          </DialogFooter>
        </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PatientFormDialog;
