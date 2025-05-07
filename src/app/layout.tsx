import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google'; // Keep Geist_Mono if used for code
import './globals.css';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Use a CSS variable for Inter
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PatientPal - Gestión de Expedientes Médicos',
  description: 'Gestiona expedientes de pacientes y citas de forma eficiente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <div className="flex flex-1">
              <AppSidebar />
              <SidebarInset className="flex-1 overflow-y-auto">
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
