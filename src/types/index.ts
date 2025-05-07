import type { Timestamp } from "firebase/firestore"; // Assuming usage of Firebase Timestamp

export interface Patient {
  id: string; // Firestore document ID
  fullName: string;
  age?: number; // Optional if DOB is primary
  nationalId: string; // DNI/Identificador
  dob: string; // ISO date string (e.g., "YYYY-MM-DD")
  address: string;
  phone: string;
  createdAt?: Timestamp | Date; // Or string date
  updatedAt?: Timestamp | Date; // Or string date
}

export type ExamResultFile = {
  type: 'file';
  fileName: string;
  fileUrl: string;
  fileRefPath: string; // Firebase Storage path
  contentType: string;
};

export type ExamResultText = {
  type: 'text';
  content: string;
};

export type ExamResult = ExamResultFile | ExamResultText;

export interface MedicalRecord {
  id: string; // Firestore document ID
  patientId: string; // Foreign key to Patient
  currentIllness: string;
  examResults: ExamResult[];
  treatment: string;
  nextAppointmentDate?: string | null; // ISO date string (e.g., "YYYY-MM-DD")
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// For form handling, especially with react-hook-form and Zod
export type PatientFormData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'age'> & {
  ageInput?: number; // If age is manually input
};

export type MedicalRecordFormData = Omit<MedicalRecord, 'id' | 'patientId' | 'createdAt' | 'updatedAt' | 'examResults'> & {
  examResultsText?: string; // Temporary field for text input
  examResultsFiles?: FileList | null; // For file uploads
};
