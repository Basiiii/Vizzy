import type React from 'react';
import { SettingsNavigation } from './settings-navigation';
import NavBar from '@/components/layout/nav-bar/nav-bar';
import { Footer } from '@/components/layout/footer';
import { getServerUser } from '@/lib/utils/token/get-server-user';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userMetadata = await getServerUser();

  return (
    <>
      <NavBar username={userMetadata?.username || ''} avatarUrl={''} />

      <div className="container mx-auto py-24 md:px-8 px-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <SettingsNavigation />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>

      <Footer />
    </>
  );
}
