import PatientListClient from '@/components/patients/PatientListClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PatientsPage() {
  // This page can remain a Server Component if PatientListClient handles all client-side logic and data fetching.
  // Or, convert this to a client component if it needs to manage state or effects directly.
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Gestión de Pacientes</CardTitle>
          <CardDescription>
            Ver, buscar, añadir y gestionar expedientes de pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientListClient />
        </CardContent>
      </Card>
    </div>
  );
}
