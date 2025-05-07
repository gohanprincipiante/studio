"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Timestamp } from 'firebase/firestore';
import { Patient, PatientFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, UserCircle, Calendar, MapPin, Phone, ShieldAlert } from 'lucide-react';
import PatientFormDialog from './PatientFormDialog';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface PatientDetailViewProps {
  patientPromise: Promise<Patient> | undefined; // Allow undefined
  patientId: string;
}

// Helper to parse YYYY-MM-DD string as local date
const parseLocalDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};


const PatientDetailView: FC<PatientDetailViewProps> = ({ patientPromise, patientId }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setPatient(null); // Reset patient state on new promise/id
    setError(null);   // Reset error state

    if (patientPromise && typeof patientPromise.then === 'function') {
      const thenResult = patientPromise.then(data => {
        setPatient(data);
        // setError(null); // Already called above
        return data; 
      });

      if (thenResult && typeof thenResult.catch === 'function') {
        thenResult.catch(err => {
          console.error("Error al cargar detalles del paciente (en catch):", err);
          setError("Error al cargar detalles del paciente. Por favor, intente de nuevo.");
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        console.error("patientPromise.then() no devolvió una promesa válida o es undefined.");
        setError("Error interno al procesar los datos del paciente.");
        setIsLoading(false);
      }
    } else {
      if (patientPromise === undefined || patientPromise === null) {
        console.warn("patientPromise no fue proporcionado a PatientDetailView o es null/undefined. No se intentará cargar.");
        // No error is set here, as parent might intentionally not provide promise yet.
      } else {
        console.error("patientPromise no es un objeto 'thenable' válido:", patientPromise);
        setError("No se pudieron cargar los datos del paciente (referencia de datos no válida).");
      }
      setIsLoading(false); 
    }
  }, [patientPromise, patientId]);


  const handleFormSubmit = async (data: PatientFormData, id?: string) => {
    if (id && patient) {
      const dobDate = parseLocalDate(data.dob);
      const age = dobDate ? differenceInYears(new Date(), dobDate) : undefined; // Age calculation should use consistent date logic
      const updatedPatient = { ...patient, ...data, age, id, updatedAt: new Date() };
      setPatient(updatedPatient);
      toast({ title: "Paciente Actualizado", description: `Los datos de ${data.fullName} han sido actualizados.` });
    }
    setIsEditing(false);
  };

  const getDisplayDate = (dateValue: Date | Timestamp | string | undefined): Date | null => {
    if (!dateValue) return null;
    if (typeof dateValue === 'string') {
      return parseLocalDate(dateValue);
    }
    if (typeof (dateValue as any).toDate === 'function') {
        const tsDate = (dateValue as Timestamp).toDate();
        return new Date(Date.UTC(tsDate.getUTCFullYear(), tsDate.getUTCMonth(), tsDate.getUTCDate()));
    }
    if (dateValue instanceof Date) {
        return new Date(Date.UTC(dateValue.getUTCFullYear(), dateValue.getUTCMonth(), dateValue.getUTCDate()));
    }
    return null;
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

  if (!patient && !isLoading) { 
    return <p className="text-muted-foreground py-4 text-center">Datos del paciente no disponibles o no encontrados.</p>;
  }
  
  if (!patient) { 
      return <p className="text-muted-foreground py-4 text-center">Cargando datos del paciente...</p>;
  }
  
  const calculateAgeDisplay = (dobString: string | undefined): string => {
    if (!dobString) return 'N/A';
    const birthDate = parseLocalDate(dobString);
    if (!birthDate) return 'N/A';
    const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
    const m = today.getUTCMonth() - birthDate.getUTCMonth();
    if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
        age--;
    }
    return `${age} años`;
  };

  const createdAtDate = getDisplayDate(patient.createdAt);
  const updatedAtDate = getDisplayDate(patient.updatedAt);
  const dobDate = getDisplayDate(patient.dob);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-3xl font-bold text-primary flex items-center">
          <UserCircle className="mr-3 h-8 w-8" />
          {patient.fullName}
        </h2>
        <Button onClick={() => setIsEditing(true)} variant="outline" className="mt-2 sm:mt-0">
          <Edit className="mr-2 h-4 w-4" /> Editar Paciente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
        <InfoItem icon={<ShieldAlert className="h-5 w-5 text-primary" />} label="DNI / ID Nacional" value={patient.nationalId} />
        <InfoItem icon={<Calendar className="h-5 w-5 text-primary" />} label="Fecha de Nacimiento" value={dobDate ? format(dobDate, 'PPP', { locale: es }) : 'N/A'} />
        <InfoItem icon={<UserCircle className="h-5 w-5 text-primary" />} label="Edad" value={calculateAgeDisplay(patient.dob)} />
        <InfoItem icon={<Phone className="h-5 w-5 text-primary" />} label="Teléfono" value={patient.phone} />
        <InfoItem icon={<MapPin className="h-5 w-5 text-primary" />} label="Dirección" value={patient.address} className="md:col-span-2" />
      </div>

      {createdAtDate && (
        <p className="text-xs text-muted-foreground mt-4">
          Expediente creado el: {format(createdAtDate, 'PPP p', { locale: es })}
          {updatedAtDate && ` | Última actualización: ${format(updatedAtDate, 'PPP p', { locale: es })}`}
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
