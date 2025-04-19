'use client';

import type React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants/routes/routes';
import { Card, CardContent } from '../ui/data-display/card';
import { Badge } from '../ui/common/badge';
import { Profile } from '@/types/profile';
interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const t = useTranslations('listing');

  return (
    <Link
      href={`${ROUTES.PROFILE}/${listing.id}`}
      key={listing.id}
      className="block group"
    >
      <Card className="overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20 p-0">
        <div className="flex h-full">
          <div className="relative w-24 h-full min-h-[100px] flex-shrink-0 overflow-hidden">
            <Image
              src={listing.image_url || '/placeholder.svg?height=100&width=96'}
              alt={listing.title}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-center space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <Badge
                variant="secondary"
                className="shrink-0 text-xs font-medium opacity-90"
              >
                {listing.type === 'giveaway' && t('types.giveaway')}
                {listing.type === 'swap' && t('types.swap')}
                {listing.type === 'sale' && t('types.sale')}
                {listing.type === 'rental' && t('types.rental')}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {listing.type === 'giveaway' && t('subtitles.giveaway')}
              {listing.type === 'swap' && t('subtitles.swap')}
              {listing.type === 'sale' && `€${listing.price || 'N/A'}`}
              {listing.type === 'rental' &&
                `€${listing.priceperday || 'N/A'} ${t('subtitles.rental')}`}
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
};

export default ListingCardSmall;
