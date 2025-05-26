import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/common/badge';
import { useTranslations } from 'next-intl';
import { ListingBasic } from '@/types/listing';
import { ROUTES } from '@/lib/constants/routes/routes';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/data-display/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/data-display/hover-card';
import { fetchUserProfile } from '@/lib/api/profile/profile';
import { Profile } from '@/types/profile';
import { MapPin, ShoppingBag, Calendar } from 'lucide-react';

interface ListingCardNormalProps {
  listing: ListingBasic;
}

const ListingCardNormal: React.FC<ListingCardNormalProps> = ({ listing }) => {
  const router = useRouter();
  const t = useTranslations('listing');
  const tp = useTranslations('profile');
  const ownerUsername = listing.owner_username;
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchOwnerProfile = async () => {
      const result = await fetchUserProfile(ownerUsername);
      if (result.data) {
        setOwnerProfile(result.data);
      }
    };
    fetchOwnerProfile();
  }, [ownerUsername]);

  const ownerName = ownerProfile?.name || 'Loading...';
  const ownerAvatar = ownerProfile?.avatarUrl;

  return (
    <div className="block group">
      <Card className="py-0 gap-0 h-full overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
        <div className="relative">
          <Link href={`${ROUTES.LISTING}/${listing.id}`} className="block">
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={
                  listing.image_url || '/placeholder.svg?height=400&width=400'
                }
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 font-medium opacity-90"
              >
                {listing.type === 'giveaway' && t('types.giveaway')}
                {listing.type === 'swap' && t('types.swap')}
                {listing.type === 'sale' && t('types.sale')}
                {listing.type === 'rental' && t('types.rental')}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              {/* Price and Owner Info Container */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xl font-bold text-primary">
                  {listing.type === 'giveaway' && t('subtitles.giveaway')}
                  {listing.type === 'swap' && t('subtitles.swap')}
                  {listing.type === 'sale' && `€${listing.price}`}
                  {listing.type === 'rental' &&
                    `€${listing.priceperday} ${t('subtitles.rental')}`}
                </p>
                {/* Owner Info */}
                <div className="flex items-center gap-2">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`${ROUTES.PROFILE}/${ownerUsername}`);
                        }}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={
                              ownerAvatar ||
                              '/placeholder.svg?height=20&width=20'
                            }
                            alt={ownerName}
                          />
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {ownerName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground font-medium">
                          {ownerName}
                        </span>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage
                            src={ownerAvatar}
                            className="rounded cursor-pointer"
                          />
                          <AvatarFallback>
                            {ownerName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">{ownerName}</h4>
                          <div className="flex items-center pt-1">
                            <MapPin className="mr-2 h-4 w-4 opacity-70" />
                            <span className="text-xs text-muted-foreground">
                              {ownerProfile?.location.slice(0, 30) + '...' ||
                                'No location set'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <ShoppingBag className="mr-2 h-4 w-4 opacity-70" />
                            <span className="text-xs text-muted-foreground">
                              {ownerProfile?.activeListings || 0}{' '}
                              {tp('stats.activeListings.label')}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 opacity-70" />
                            <span className="text-xs text-muted-foreground">
                              {tp('stats.memberSince.label')}{' '}
                              {ownerProfile?.memberSince || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </CardContent>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ListingCardNormal;
