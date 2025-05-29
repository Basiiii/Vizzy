'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes/routes';
import { CardContent } from '../ui/data-display/card';
import { Badge } from '../ui/common/badge';
import { Profile } from '@/types/profile';
import { MapPin, ShoppingBag, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/data-display/avatar';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '../ui/data-display/hover-card';
import { fetchContacts } from '@/lib/api/contacts/contacts';
import { useEffect, useState } from 'react';
import { MobileIcon } from '@radix-ui/react-icons';
import { Contact } from '@/types/contact';
import { useTranslations } from 'next-intl';

export default function ProfileHoverCard({ profile }: { profile: Profile }) {
  const t = useTranslations('profile');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserContacts = async () => {
      if (!profile?.id) return;

      try {
        setIsLoadingContacts(true);
        setContactsError(null);
        const result = await fetchContacts(profile.id);
        if (result.data !== null) {
          setContacts(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        setContactsError('Failed to load contacts');
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchUserContacts();
  }, [profile?.id]);

  // Helper function to get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2);
  };

  // Early return moved after hooks
  if (!profile?.name || !profile?.username) {
    return null;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="font-medium cursor-pointer underline underline-offset-2">
          {profile.name}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[450px] bg-opacity-85 backdrop-blur-xl p-0">
        <Link
          href={`${ROUTES.PROFILE}/${profile.username}`}
          key={profile.username}
          className="block group"
        >
          <div className="flex h-full items-center">
            <div className="flex-shrink-0 ml-4 mr-2">
              <Avatar className="h-24 w-24 shadow-lg bg-gradient-to-b group-hover:scale-105 transition-transform duration-300">
                <AvatarImage
                  src={profile.avatarUrl || undefined}
                  alt={t('avatar.altText', { username: profile.username })}
                />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
            </div>

            <CardContent className="flex-1 p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {profile.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {profile.location
                        ? `${profile.location.slice(0, 30)}...`
                        : t('location.notAvailable')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ShoppingBag className="h-3 w-3" />
                    <span>
                      {typeof profile.totalSales === 'number'
                        ? `${profile.totalSales} ${t(
                            'stats.totalTransactions.label',
                          )}`
                        : t('stats.noTransactions')}
                    </span>
                  </div>
                </div>
                {profile.isVerified && (
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-xs font-medium opacity-90"
                  >
                    {t('header.verifiedBadge')}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {profile.memberSince
                  ? `${t('stats.memberSince.label')}: ${profile.memberSince}`
                  : t('stats.memberSinceNotAvailable')}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MobileIcon className="h-3 w-3" />
                {isLoadingContacts
                  ? t('contacts.loading')
                  : contactsError
                  ? t('contacts.error')
                  : contacts[0]
                  ? `${contacts[0].name} (${contacts[0].phone_number})`
                  : t('contacts.noContacts')}
              </p>
            </CardContent>
          </div>
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
}
