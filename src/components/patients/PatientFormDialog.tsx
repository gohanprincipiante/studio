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
import { format } from 'date-fns';

const patientSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  nationalId: z.string().min(5, 'National ID must be at least 5 characters'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format'),
  // ageInput: z.number().optional().nullable(), // Removed as DOB is primary
});


interface PatientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData, id?: string) => Promise<void>;
  defaultValues?: Patient | null;
}

const PatientFormDialog: FC<PatientFormDialogProps> = ({ isOpen, onClose, onSubmit, defaultValues }) => {
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
      dob: defaultValues.dob ? defaultValues.dob.split('T')[0] : '', // Ensure YYYY-MM-DD
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
    if (defaultValues) {
      reset({
        ...defaultValues,
        dob: defaultValues.dob ? defaultValues.dob.split('T')[0] : '', // Ensure YYYY-MM-DD for editing
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
          <DialogTitle>{defaultValues ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          <DialogDescription>
            {defaultValues ? 'Update the patient details below.' : 'Fill in the details for the new patient.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-10rem)] pr-6"> {/* Adjust max-h as needed */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register('fullName')} aria-invalid={errors.fullName ? "true" : "false"} />
            {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <Label htmlFor="nationalId">DNI / National ID</Label>
            <Input id="nationalId" {...register('nationalId')} aria-invalid={errors.nationalId ? "true" : "false"} />
            {errors.nationalId && <p className="text-sm text-destructive mt-1">{errors.nationalId.message}</p>}
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                 <DatePicker
                  date={field.value ? new Date(field.value + 'T00:00:00') : undefined} // Ensure date is parsed correctly locally
                  setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                  placeholder="Select date of birth"
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
              )}
            />
            {errors.dob && <p className="text-sm text-destructive mt-1">{errors.dob.message}</p>}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} aria-invalid={errors.address ? "true" : "false"} />
            {errors.address && <p className="text-sm text-destructive mt-1">{errors.address.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" {...register('phone')} aria-invalid={errors.phone ? "true" : "false"} />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
          </div>
          
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (defaultValues ? 'Saving...' : 'Adding...') : (defaultValues ? 'Save Changes' : 'Add Patient')}
            </Button>
          </DialogFooter>
        </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PatientFormDialog;
