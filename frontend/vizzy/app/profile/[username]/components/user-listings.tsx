import ListingCard from '@/components/ui/listing-card';

interface Listing {
  id: string;
  title: string;
  type: 'sale' | 'rental' | 'giveaway' | 'swap';
  price?: string;
  pricePerDay?: string;
  imageUrl: string;
}

export default function UserListings() {
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
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
