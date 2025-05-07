"use client";

import type { FC } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Filter, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Patient, MedicalRecord } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, isFuture, startOfDay } from 'date-fns';
import Link from 'next/link';

// Mock data - replace with Firebase fetching.
// Assuming MedicalRecords are fetched with their associated Patient details or a lookup is performed.
const mockPatients: Patient[] = [
  { id: '1', fullName: 'Alice Wonderland', nationalId: 'ID123456', dob: '1994-01-15', address: '123 Fantasy Lane', phone: '555-0101' },
  { id: '2', fullName: 'Bob The Builder', nationalId: 'ID789012', dob: '1979-05-20', address: '456 Construction Rd', phone: '555-0202' },
  { id: '4', fullName: 'Diana Prince', nationalId: 'ID000001', dob: '1980-03-22', address: 'Themyscira', phone: '555-0404' },
];

// Helper to create a date string for mocking, avoiding timezone issues with simple new Date()
const createMockDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return format(date, 'yyyy-MM-dd');
};

const mockMedicalRecords: MedicalRecord[] = [
  { id: 'mr1', patientId: '1', currentIllness: 'Flu', examResults: [{type: 'text', content: 'Normal temperature'}], treatment: 'Rest', nextAppointmentDate: createMockDateString(3) },
  { id: 'mr2', patientId: '2', currentIllness: 'Checkup', examResults: [{type: 'text', content: 'All good'}], treatment: 'None', nextAppointmentDate: createMockDateString(7) },
  { id: 'mr3', patientId: '1', currentIllness: 'Follow-up', examResults: [{type: 'text', content: 'Recovered'}], treatment: 'Discharge', nextAppointmentDate: createMockDateString(10) },
  { id: 'mr4', patientId: '4', currentIllness: 'Sprained Ankle', examResults: [{type: 'text', content: 'X-Ray clear'}], treatment: 'Rest and Ice', nextAppointmentDate: createMockDateString(1) },
  { id: 'mr5', patientId: '2', currentIllness: 'Dental Cleaning', examResults: [{type: 'text', content: 'No cavities'}], treatment: 'Floss more', nextAppointmentDate: createMockDateString(0) }, // Today's appointment
];


interface Appointment extends MedicalRecord {
  patient?: Patient; // Patient details denormalized or joined
}

// Helper to parse YYYY-MM-DD string as local date to avoid timezone issues
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};


const AppointmentListClient: FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfDay(new Date())); // Default to today, start of day
  const [showAllUpcoming, setShowAllUpcoming] = useState<boolean>(false);

  useEffect(() => {
    // Simulate fetching and merging data
    const mergedAppointments: Appointment[] = mockMedicalRecords
      .filter(mr => mr.nextAppointmentDate) // Only consider records with a next appointment
      .map(mr => {
        const patient = mockPatients.find(p => p.id === mr.patientId);
        return { ...mr, patient };
      })
      .sort((a, b) => { // Sort by date, then by patient name
        if (!a.nextAppointmentDate || !b.nextAppointmentDate) return 0;
        const dateA = parseLocalDate(a.nextAppointmentDate);
        const dateB = parseLocalDate(b.nextAppointmentDate);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.patient?.fullName.localeCompare(b.patient?.fullName || '') || 0;
      });
    setAppointments(mergedAppointments);
  }, []);

  const filteredAppointments = useMemo(() => {
    if (showAllUpcoming) {
      // For "all upcoming", compare against the start of today
      const today = startOfDay(new Date());
      return appointments.filter(app => {
        if (!app.nextAppointmentDate) return false;
        const appDate = parseLocalDate(app.nextAppointmentDate);
        return isFuture(appDate) || isSameDay(appDate, today); // Include today as upcoming
      });
    }
    if (!selectedDate) return [];
    return appointments.filter(app => 
      app.nextAppointmentDate && isSameDay(parseLocalDate(app.nextAppointmentDate), selectedDate)
    );
  }, [appointments, selectedDate, showAllUpcoming]);

  const handleDateChange = (date?: Date) => {
    setSelectedDate(date ? startOfDay(date) : undefined);
    if (date) setShowAllUpcoming(false);
  }

  const toggleShowAllUpcoming = () => {
    setShowAllUpcoming(prev => !prev);
    if (!showAllUpcoming) { // If we are about to show all upcoming, clear selected date
      setSelectedDate(undefined);
    } else { // If we are toggling off "show all", default to today
      setSelectedDate(startOfDay(new Date()));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Filter Appointments</h3>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <DatePicker
            date={selectedDate}
            setDate={handleDateChange}
            placeholder="Filter by date"
            className="w-full sm:w-[280px]"
          />
          <Button onClick={toggleShowAllUpcoming} variant="outline" className="w-full sm:w-auto">
            {showAllUpcoming ? "Show Specific Date" : "Show All Upcoming"}
          </Button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <CalendarDays className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="mt-4">No Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              {showAllUpcoming ? "There are no upcoming appointments." : (selectedDate ? `No appointments scheduled for ${format(selectedDate, 'PPP')}.` : "Please select a date or show all upcoming appointments.")}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((app) => (
            <Card key={app.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {app.patient?.fullName || 'Unknown Patient'}
                    </CardTitle>
                    <CardDescription>
                      Appointment for: {app.currentIllness}
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="text-sm">
                    {app.nextAppointmentDate ? format(parseLocalDate(app.nextAppointmentDate), 'p, PPP') : 'Date N/A'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <p><strong className="text-foreground">Patient ID:</strong> {app.patient?.nationalId || 'N/A'}</p>
                  <p><strong className="text-foreground">Treatment:</strong> {app.treatment || 'N/A'}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/patients/${app.patientId}`}>
                    <Users className="mr-2 h-4 w-4" /> View Patient Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentListClient;
