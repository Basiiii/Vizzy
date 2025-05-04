'use client';

import type React from 'react';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes/routes';
import { Card, CardContent } from '../ui/data-display/card';
import { Badge } from '../ui/common/badge';
import { Profile } from '@/types/profile';
import { MapPin, ShoppingBag, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/data-display/avatar';

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
          <div className="flex-shrink-0 ml-4 mr-2">
            <Avatar className="h-24 w-24 shadow-lg bg-gradient-to-b group-hover:scale-105 transition-transform duration-300">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback>
                {profile.name
                  .split(' ')
                  .map((name) => name[0].toUpperCase())
                  .join('')}
              </AvatarFallback>
            </Avatar>
          </div>

          <CardContent className="flex-1 py-4">
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
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {'Member Since'}: {profile.memberSince}
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
};

export default ProfileCard;
