import { ListingType, ProductCondition } from './listing';
export interface CreateListingDto {
  //common fields
  title: string;
  description: string;
  category: string;
  listing_type: ListingType;
  //sale
  product_condition?: ProductCondition;
  price?: number;
  is_negotiable?: boolean;
  //rental
  deposit_required?: boolean;
  cost_per_day?: number;
  auto_close_date?: Date;
  rental_duration_limit?: number;
  late_fee?: number;
  //swap
  desired_item?: string;
  //giveaway
  recipient_requirements?: string;
}
