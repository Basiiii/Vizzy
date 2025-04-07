import { ListingType, ListingStatus } from './listing.dto';
import { ProductCondition } from './sale-listing.dto';

// Base create DTO with common fields
export interface CreateListingDto {
  title: string;
  description: string;
  category_id: string;
  listing_type: ListingType;
  listing_status?: ListingStatus;
  image_url: string;
}

// Type-specific create DTOs
export interface CreateRentalListingDto extends CreateListingDto {
  listing_type: 'rental';
  deposit_required?: boolean;
  cost_per_day: string;
  auto_close_date?: string;
  rental_duration_limit?: number;
  late_fee?: string;
}

export interface CreateSaleListingDto extends CreateListingDto {
  listing_type: 'sale';
  price: string;
  product_condition: ProductCondition;
  is_negotiable: boolean;
}

export interface CreateSwapListingDto extends CreateListingDto {
  listing_type: 'swap';
  desired_item: string;
}

export interface CreateGiveawayListingDto extends CreateListingDto {
  listing_type: 'giveaway';
  recipient_requirements?: string;
}

// Union type for create DTOs
export type CreateListingUnionDto =
  | CreateRentalListingDto
  | CreateSaleListingDto
  | CreateSwapListingDto
  | CreateGiveawayListingDto;
