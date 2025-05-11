import { ListingType, ProductCondition } from './listing';
export interface CreateListingDto {
  id?: number;
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
  deposit_value?: number | null;
  cost_per_day?: number;
  auto_close_date?: Date | null;
  rental_duration_limit?: number | null;
  late_fee?: number | null;
  //swap
  desired_item?: string;
  //giveaway
  recipient_requirements?: string;
}
