"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Timestamp } from 'firebase/firestore';
import { Patient, PatientFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, UserCircle, Calendar, MapPin, Phone, ShieldAlert } from 'lucide-react';
import PatientFormDialog from './PatientFormDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface PatientDetailViewProps {
  patientPromise: Promise<Patient>;
  patientId: string;
}

const PatientDetailView: FC<PatientDetailViewProps> = ({ patientPromise, patientId }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    patientPromise
      .then(data => {
        setPatient(data);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to load patient details:", err);
        setError("Failed to load patient details. Please try again.");
        setPatient(null);
      })
      .finally(() => setIsLoading(false));
  }, [patientPromise, patientId]);


  const handleFormSubmit = async (data: PatientFormData, id?: string) => {
    // Simulate API call
    if (id && patient) {
      const updatedPatient = { ...patient, ...data, id, updatedAt: new Date() };
      setPatient(updatedPatient); // Update local state
      // TODO: Actual Firebase update call
      toast({ title: "Patient Updated", description: `${data.fullName}'s details have been updated.` });
    }
    setIsEditing(false);
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
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md">{error}</div>;
  }

  if (!patient) {
    return <p className="text-muted-foreground">Patient data not available.</p>;
  }
  
  const calculateAge = (dobString: string) => {
    const birthDate = new Date(dobString + 'T00:00:00'); // Ensure local interpretation
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  const createdAtDate = getDisplayDate(patient.createdAt);
  const updatedAtDate = getDisplayDate(patient.updatedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-3xl font-bold text-primary flex items-center">
          <UserCircle className="mr-3 h-8 w-8" />
          {patient.fullName}
        </h2>
        <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-2 sm:mt-0">
          <Edit className="mr-2 h-4 w-4" /> Edit Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
        <InfoItem icon={<ShieldAlert className="h-5 w-5 text-primary" />} label="National ID" value={patient.nationalId} />
        <InfoItem icon={<Calendar className="h-5 w-5 text-primary" />} label="Date of Birth" value={patient.dob ? format(new Date(patient.dob  + 'T00:00:00'), 'PPP') : 'N/A'} />
        <InfoItem icon={<UserCircle className="h-5 w-5 text-primary" />} label="Age" value={patient.dob ? `${calculateAge(patient.dob)} years old` : 'N/A'} />
        <InfoItem icon={<Phone className="h-5 w-5 text-primary" />} label="Phone" value={patient.phone} />
        <InfoItem icon={<MapPin className="h-5 w-5 text-primary" />} label="Address" value={patient.address} className="md:col-span-2" />
      </div>

      {createdAtDate && (
        <p className="text-xs text-muted-foreground mt-4">
          Record created on: {format(createdAtDate, 'PPP p')}
          {updatedAtDate && ` | Last updated: ${format(updatedAtDate, 'PPP p')}`}
        </p>
      )}

      <PatientFormDialog
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSubmit={handleFormSubmit}
        defaultValues={patient}
      />
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}

const InfoItem: FC<InfoItemProps> = ({ icon, label, value, className }) => (
  <div className={cn("flex items-start", className)}>
    <div className="mr-3 shrink-0 pt-0.5">{icon}</div>
    <div>
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value}</p>
    </div>
  </div>
);


export default PatientDetailView;
