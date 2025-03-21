import { Separator } from '@/components/ui/separator';
import { ProfileSidebar } from '@/app/account-settings/components/account-settings-sidebar';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface ProfileLayoutProps {
  children: ReactNode;
}

export const profileRoutes = {
  profile: '/account-settings/profile',
  account: '/account-settings/account',
};

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const t = useTranslations();
  // Define navigation items
  const navItems = [
    {
      title: t('accountPageCommon.profile'),
      href: profileRoutes.profile,
    },
    {
      title: t('accountPageCommon.account'),
      href: profileRoutes.account,
    },
    // Add more navigation items as needed
  ];

  return (
    <div className="w-full min-h-screen bg-background pt-12">
      <div className="w-full mx-auto p-4 space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            {t('accountPageCommon.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('accountPageCommon.description')}
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
