// This page will be a server component initially, fetching data.
// Client-side interactions (like adding/editing medical records) will be in separate client components.
import { Suspense } from 'react';
import PatientDetailView from '@/components/patients/PatientDetailView';
import MedicalRecordList from '@/components/medical-records/MedicalRecordList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data fetching functions - replace with actual Firebase calls
async function getPatientDetails(patientId: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const mockPatients = [
    { id: '1', fullName: 'Alice Wonderland', age: 30, nationalId: 'ID123456', dob: '1994-01-15', address: '123 Fantasy Lane', phone: '555-0101', createdAt: new Date() },
    { id: '2', fullName: 'Bob The Builder', age: 45, nationalId: 'ID789012', dob: '1979-05-20', address: '456 Construction Rd', phone: '555-0202', createdAt: new Date() },
  ];
  const patient = mockPatients.find(p => p.id === patientId);
  if (!patient) throw new Error("Patient not found");
  return patient;
}

async function getMedicalRecords(patientId: string) {
  await new Promise(resolve => setTimeout(resolve, 700));
  const mockMedicalRecords = [
    { id: 'mr1', patientId: '1', currentIllness: 'Flu', examResults: [{type: 'text', content: 'Normal temperature'}], treatment: 'Rest', nextAppointmentDate: '2024-08-15', createdAt: new Date() },
    { id: 'mr2', patientId: '1', currentIllness: 'Checkup', examResults: [{type: 'text', content: 'All good'}], treatment: 'None', createdAt: new Date(new Date().setDate(new Date().getDate() - 30)) },
    { id: 'mr3', patientId: '2', currentIllness: 'Broken Arm', examResults: [{type: 'file', fileName: 'xray.pdf', fileUrl: '#', fileRefPath: 'files/xray.pdf', contentType: 'application/pdf'}], treatment: 'Cast', nextAppointmentDate: '2024-09-01', createdAt: new Date() },
  ];
  return mockMedicalRecords.filter(mr => mr.patientId === patientId);
}

export default async function PatientDetailPage({ params }: { params: { patientId: string } }) {
  const { patientId } = params;

  // Fetch in parallel
  const patientData = getPatientDetails(patientId);
  const medicalRecordsData = getMedicalRecords(patientId);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Perfil del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PatientDetailSkeleton />}>
            <PatientDetailView patientPromise={patientData} patientId={patientId}/>
          </Suspense>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Historial Médico</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MedicalRecordListSkeleton />}>
            <MedicalRecordList medicalRecordsPromise={medicalRecordsData} patientId={patientId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-32 mt-4" />
    </div>
  );
}

function MedicalRecordListSkeleton() {
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
