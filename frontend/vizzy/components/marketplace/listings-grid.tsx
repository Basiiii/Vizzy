import ListingCard from '@/components/listings/listing-card';
import type { ListingBasic } from '@/types/listing';

interface ListingsGridProps {
  listings: ListingBasic[];
  loading: boolean;
}

export function ListingsGrid({ listings, loading }: ListingsGridProps) {
  if (loading && listings.length === 0) {
    return <div className="text-center py-12">Loading listings...</div>;
  }

  if (listings.length === 0) {
    return <div className="text-center py-12">No listings found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
