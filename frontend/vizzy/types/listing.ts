export interface ListingBasic {
  id: string;
  title: string;
  type: 'sale' | 'rental' | 'giveaway' | 'swap';
  price?: string;
  priceperday?: string;
  image_url: string;
}

export type ListingStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'sold'
  | 'rented';
export type ListingType = 'sale' | 'rental' | 'giveaway' | 'swap';
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

interface BaseListing {
  id: string;
  title: string;
  description: string;
  date_created: string;
  owner_id: string;
  category_id: string;
  listing_status: ListingStatus;
  listing_type: ListingType;
  image_url: string;
}

export interface SaleListing extends BaseListing {
  listing_type: 'sale';
  price: string;
  product_condition: ProductCondition;
  is_negotiable: boolean;
}

export interface RentalListing extends BaseListing {
  listing_type: 'rental';
  deposit_required: boolean;
  cost_per_day: string;
  auto_close_date: string;
  rental_duration_limit: number;
  late_fee: string;
}

export interface SwapListing extends BaseListing {
  listing_type: 'swap';
  desired_item: string;
}

export interface GiveawayListing extends BaseListing {
  listing_type: 'giveaway';
  recipient_requirements: string;
}

export type Listing =
  | SaleListing
  | RentalListing
  | SwapListing
  | GiveawayListing;
