import AppointmentListClient from '@/components/appointments/AppointmentListClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Próximas Citas</CardTitle>
          <CardDescription>
            Ver y gestionar citas programadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentListClient />
        </CardContent>
      </Card>
    </div>
  );
}
