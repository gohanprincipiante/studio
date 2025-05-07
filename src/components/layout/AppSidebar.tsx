"use client";
import type { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, CalendarClock, LayoutDashboard } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
  matchExact?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Panel', icon: LayoutDashboard, matchExact: true },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/appointments', label: 'Citas', icon: CalendarClock },
];

const AppSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="p-4 items-center justify-center hidden md:flex">
        {/* Optional: Logo/Brand Icon for collapsed state */}
        {/* <Stethoscope className="h-7 w-7 text-primary" /> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={item.matchExact ? pathname === item.href : pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, className: "ml-1" }}
                  className={cn(
                    "justify-start",
                    (item.matchExact ? pathname === item.href : pathname.startsWith(item.href)) 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                      {item.label}
                    </span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
      </SidebarFooter> */}
    </Sidebar>
  );
};

export default AppSidebar;
