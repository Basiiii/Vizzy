export type ListingType = 'sale' | 'rental' | 'giveaway' | 'swap';
export type ListingStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'sold'
  | 'rented';

export interface Listing {
  id: string;
  title: string;
  description: string;
  date_created: string; // ISO date string
  owner_id: string;
  category_id: string;
  listing_status: ListingStatus;
  listing_type: ListingType;
  image_url: string;
}
