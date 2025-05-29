import type { Metadata } from 'next';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/data-display/avatar';
import { Badge } from '@/components/ui/common/badge';
import { Card } from '@/components/ui/data-display/card';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/common/button';
import UserListings from './components/user-listings';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getServerUser } from '@/lib/utils/token/get-server-user';
import { ProfileMetadata } from '@/types/profile';
import { ROUTES } from '@/lib/constants/routes/routes';
import { fetchUserProfile } from '@/lib/api/profile/profile';
// import BlockButton from '@/components/ui/common/block-button';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata(
  props: ProfilePageProps,
): Promise<Metadata> {
  const params = await props.params;
  const username = params.username;

  return {
    title: `${username}'s Profile | Marketplace`,
    description: `View ${username}'s profile and listings`,
  };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const { username } = params;
  const t = await getTranslations('profile');

  const tokenUserData: ProfileMetadata | null = await getServerUser();
  const isCurrentUser: boolean | null =
    username === tokenUserData?.username || null;

  const profileResult = await fetchUserProfile(username);

  if (profileResult.error || !profileResult.data) {
    // TODO: improve UI here
    return (
      <main className="container mx-auto py-20 max-w-10/12">
        <div className="text-center text-red-500">
          {t('error.failedToLoadProfile')}
        </div>
      </main>
    );
  }

  const user = profileResult.data;

  return (
    <main className="container mx-auto py-20 max-w-10/12">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col items-center md:flex-row md:items-center gap-6">
          <Avatar className="h-32 w-32">
            <AvatarImage
              src={user.avatarUrl}
              alt={t('avatar.altText', { username: username })}
            />
            <AvatarFallback>
              {user.name
                .split(' ')
                .map((name) => name[0].toUpperCase())
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {isCurrentUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="md:ml-auto cursor-pointer"
                  asChild
                >
                  <Link href={ROUTES.SETTINGS}>
                    {t('header.editProfileButton')}
                  </Link>
                </Button>
              ) : (
                // <div className="md:ml-auto">
                //   <BlockButton targetUserId={user.id} />
                // </div>
                <></>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {user.isVerified && (
                <Badge variant="secondary">{t('header.verifiedBadge')}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <div className="text-2xl font-bold">{user.activeListings}</div>
          <div className="text-sm text-muted-foreground">
            {t('stats.activeListings.label')}
          </div>
        </Card>
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <div className="text-2xl font-bold">{user.totalSales}</div>
          <div className="text-sm text-muted-foreground">
            {t('stats.totalTransactions.label')}
          </div>
        </Card>
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <div className="text-2xl font-bold">{user.memberSince}</div>
          <div className="text-sm text-muted-foreground">
            {t('stats.memberSince.label')}
          </div>
        </Card>
      </div>

      {/* Listings Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {t('listingsSection.title')}
          </h2>
        </div>
        {user.activeListings > 0 ? (
          <UserListings userid={user.id} />
        ) : (
          <p className="text-gray-500">
            {t('listingsSection.noActiveListings')}
          </p>
        )}
      </section>
    </main>
  );
}
