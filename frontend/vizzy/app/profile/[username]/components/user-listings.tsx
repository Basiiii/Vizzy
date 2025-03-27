import ListingCard from '@/components/listings/listing-card';
import { Listing } from '@/types/listing';

interface UserListingsProps {
  userid: string;
}

export default async function UserListings(props: UserListingsProps) {
  // Fetch user data from an API
  const response = await fetch(
    `http://localhost:3000/users/listings?userid=${props.userid}&page=1&limit=8`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch user listings');
  }
  const listings: Listing[] = await response.json();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
