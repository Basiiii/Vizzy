'use client';

import type React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes/routes';
import { Card, CardContent } from '../ui/data-display/card';
import { Badge } from '../ui/common/badge';
import { Profile } from '@/types/profile';
import { MapPin, ShoppingBag } from 'lucide-react';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <Link
      href={`${ROUTES.PROFILE}/${profile.username}`}
      key={profile.username}
      className="block group"
    >
      <Card className="overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-md hover:border-primary/20 p-0">
        <div className="flex h-full items-center">
          <div className="relative w-24 h-24 min-h-[96px] flex-shrink-0 overflow-hidden rounded-full border-4 border-green-500 shadow-lg bg-gradient-to-br from-green-100 to-green-200 group-hover:scale-105 transition-transform duration-300 ml-4 mr-2">
            <Image
              src={
                profile.avatarUrl
                  ? profile.avatarUrl
                  : '/placeholder.svg?height=100&width=96'
              }
              alt={profile.name}
              fill
              sizes="96px"
              className="object-cover rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/placeholder.svg?height=100&width=96') {
                  target.src = '/placeholder.svg?height=100&width=96';
                }
              }}
            />
          </div>
          <CardContent className="flex-1 p-4 flex flex-col justify-center space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {profile.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ShoppingBag className="h-3 w-3" />
                  <span>
                    {profile.totalSales} {'Total Sales'}
                  </span>
                </div>
              </div>
              {profile.isVerified && (
                <Badge
                  variant="secondary"
                  className="shrink-0 text-xs font-medium opacity-90"
                >
                  {'Verified'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {'Member Since'}: {profile.memberSince}
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
};

export default ProfileCard;
