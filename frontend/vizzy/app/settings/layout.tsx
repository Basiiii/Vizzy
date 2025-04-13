import type React from 'react';
import { SettingsNavigation } from './settings-navigation';
import NavBar from '@/components/layout/nav-bar/nav-bar';
import { Footer } from '@/components/layout/footer';
import { getServerUser } from '@/lib/utils/token/get-server-user';
import {
  PROFILE_PICTURE_PATH,
  SUPABASE_STORAGE_URL,
} from '@/lib/constants/storage';
import { getTranslations } from 'next-intl/server';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userMetadata = await getServerUser();
  const t = await getTranslations('accountPageCommon');

  return (
    <>
      <NavBar
        username={userMetadata?.username || ''}
        avatarUrl={`${SUPABASE_STORAGE_URL}/${PROFILE_PICTURE_PATH}/${userMetadata?.id}`}
      />

      <div className="container mx-auto py-24 md:px-8 px-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
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
