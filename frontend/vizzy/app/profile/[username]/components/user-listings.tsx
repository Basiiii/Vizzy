import ListingCard from '@/components/listings/listing-card';
import { ListingBasic } from '@/types/listing';

interface UserListingsProps {
  userid: string;
}

export default async function UserListings(props: UserListingsProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  if (!API_URL || !API_VERSION)
    throw new Error('API_URL or API_VERSION is not defined');

  // Fetch user data from an API
  const response = await fetch(
    `${API_URL}/${API_VERSION}/listings?userid=${props.userid}&page=1&limit=8`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch user listings');
  }
  const listings: ListingBasic[] = await response.json();
  console.log(listings);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
