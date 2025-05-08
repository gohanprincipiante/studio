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
  manifest: '/manifest.json', // Added manifest link
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="PatientPal" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PatientPal" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#008080" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#008080" />

        {/* 
          It's generally recommended to let Next.js handle viewport meta tags.
          If specific viewport settings are needed, they can be added here,
          but often the default Next.js behavior is sufficient.
          Example: <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover" />
        */}
      </head>
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
