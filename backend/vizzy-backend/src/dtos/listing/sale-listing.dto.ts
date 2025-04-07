import { Listing } from './listing.dto';

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface SaleListing extends Listing {
  listing_type: 'sale';
  price: string;
  product_condition: ProductCondition;
  is_negotiable: boolean;
}
