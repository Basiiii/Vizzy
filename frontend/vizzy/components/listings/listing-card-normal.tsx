import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/common/badge';
import { useTranslations } from 'next-intl';
import { ListingBasic } from '@/types/listing';
import { ROUTES } from '@/lib/constants/routes/routes';

interface ListingCardNormalProps {
  listing: ListingBasic;
}

const ListingCardNormal: React.FC<ListingCardNormalProps> = ({ listing }) => {
  const t = useTranslations('listing');

  return (
    <Link
      href={`${ROUTES.LISTING}/${listing.id}`}
      key={listing.id}
      className="block group"
    >
      <Card className="py-0 gap-0 h-full overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:translate-y-[-4px]">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={listing.image_url || '/placeholder.svg?height=400&width=400'}
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
              `€${listing.priceperday} ${t('subtitles.rental')}`}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCardNormal;
