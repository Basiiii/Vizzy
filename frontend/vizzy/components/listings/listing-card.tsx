import { ListingBasic } from '@/types/listing';
import ListingCardNormal from './listing-card-normal';
import ListingCardSmall from './listing-card-small';

interface ListingCardProps {
  listing: ListingBasic;
  size?: 'normal' | 'small';
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  size = 'normal',
}) => {
  if (size === 'small') {
    return <ListingCardSmall listing={listing} />;
  }

  return <ListingCardNormal listing={listing} />;
};

export default ListingCard;
