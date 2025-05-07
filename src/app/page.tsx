import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, CalendarPlus } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Welcome to PatientPal</CardTitle>
          <CardDescription className="text-lg">
            Your modern solution for managing patient records and appointments seamlessly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <p>
              PatientPal helps you streamline your medical practice by providing easy-to-use tools for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Patient registration and record keeping</li>
              <li>Managing medical histories and exam results</li>
              <li>Tracking upcoming appointments</li>
              <li>Securely storing patient data</li>
            </ul>
            <div className="flex gap-4 pt-4">
              <Button asChild size="lg">
                <Link href="/patients">
                  <Users className="mr-2 h-5 w-5" /> View Patients
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/appointments">
                  <CalendarPlus className="mr-2 h-5 w-5" /> Upcoming Appointments
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <Image
              src="https://picsum.photos/800/500"
              alt="Healthcare professional working on a laptop"
              width={800}
              height={500}
              className="rounded-lg object-cover shadow-md"
              data-ai-hint="healthcare medical"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <FeatureCard
          title="Patient Management"
          description="Easily add, view, edit, and search patient records. Keep all vital information organized and accessible."
          icon={<Users className="h-8 w-8 text-primary" />}
          link="/patients"
          linkText="Manage Patients"
        />
        <FeatureCard
          title="Appointment Scheduling"
          description="Track upcoming appointments and manage your schedule effectively. (Full scheduling coming soon)"
          icon={<CalendarPlus className="h-8 w-8 text-primary" />}
          link="/appointments"
          linkText="View Appointments"
        />
         <FeatureCard
          title="Secure Data Storage"
          description="Leverage Firebase for secure and reliable storage of patient data and medical files."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
          }
          link="#"
          linkText="Learn More (Coming Soon)"
          disabledLink
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
  disabledLink?: boolean;
}

function FeatureCard({ icon, title, description, link, linkText, disabledLink }: FeatureCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button asChild variant={disabledLink ? "secondary" : "default"} className={disabledLink ? "cursor-not-allowed" : ""} disabled={disabledLink}>
          <Link href={disabledLink ? "#" : link} aria-disabled={disabledLink} tabIndex={disabledLink ? -1 : undefined}>
            {linkText}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
