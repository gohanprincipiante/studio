"use client";
import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Stethoscope } from 'lucide-react'; // Placeholder icon

const AppHeader: FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="md:hidden mr-2">
            <SidebarTrigger />
          </div>
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="text-primary">PatientPal</span>
          </Link>
        </div>
        
        {/* Placeholder for User Profile / Actions */}
        {/* <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="https://picsum.photos/40/40" alt="User" data-ai-hint="user avatar" />
            <AvatarFallback>PP</AvatarFallback>
          </Avatar>
        </div> */}
      </div>
    </header>
  );
};

export default AppHeader;
