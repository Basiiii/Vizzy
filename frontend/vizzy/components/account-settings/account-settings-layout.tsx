import { Separator } from '@/components/ui/separator';
import { ProfileSidebar } from '@/components/account-settings/account-settings-sidebar';
import type { ReactNode } from 'react';

interface ProfileLayoutProps {
  children: ReactNode;
  currentPath: string;
}

export function ProfileLayout({ children, currentPath }: ProfileLayoutProps) {
  // Define navigation items
  const navItems = [
    {
      title: 'Profile',
      href: '/account/profile',
      active: currentPath === '/account/profile',
    },
    {
      title: 'Account',
      href: '/account/account-data',
      active: currentPath === '/account/account-data',
    },
    // Add more navigation items as needed
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage account settings and set preferences.
          </p>
        </div>
        <Separator className="my-6" />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <ProfileSidebar items={navItems} />

          {/* Vertical Separator */}
          <Separator
            orientation="vertical"
            className="hidden md:block h-auto"
          />

          {/* Main Content */}
          <div className="flex-1 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
