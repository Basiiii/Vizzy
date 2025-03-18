import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface Listing {
  id: string;
  title: string;
  type: 'sale' | 'rental' | 'giveaway' | 'swap';
  price?: string; // For sales
  pricePerDay?: string; // For rentals
  imageUrl: string;
}

export default function UserListings() {
  const t = useTranslations('listing');

  // TODO: fetch data
  const mockListings: Listing[] = [
    {
      id: '101',
      title: 'Mountain Bike',
      type: 'sale',
      price: '299.99',
      imageUrl:
        'https://images.unsplash.com/photo-1621122940876-2b3be129159c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '102',
      title: 'Downtown Apartment',
      type: 'rental',
      pricePerDay: '50',
      imageUrl:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '103',
      title: 'Bookshelf',
      type: 'giveaway',
      imageUrl:
        'https://images.unsplash.com/photo-1593430980369-68efc5a5eb34?q=80&w=2085&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: '104',
      title: 'Gaming Chair',
      type: 'swap',
      imageUrl:
        'https://images.unsplash.com/photo-1622086611300-1f523c5571c5?q=80&w=1998&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {mockListings.map((listing) => (
        <Link
          href={`/listings/${listing.id}`}
          key={listing.id}
          className="block group"
        >
          <Card className="py-0 gap-0 h-full overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={
                  listing.imageUrl || '/placeholder.svg?height=400&width=400'
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
              <p className="text-xl font-bold mt-2 text-primary">
                {listing.type === 'giveaway' && t('subtitles.giveaway')}
                {listing.type === 'swap' && t('subtitles.swap')}
                {listing.type === 'sale' && `€${listing.price}`}
                {listing.type === 'rental' &&
                  `€${listing.pricePerDay} ${t('subtitles.rental')}`}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
