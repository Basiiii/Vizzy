import { Listing } from './listing.dto';

export type ProductCondition =
  | 'New'
  | 'Like New'
  | 'Very Good'
  | 'Fair'
  | 'Good';

export interface SaleListing extends Listing {
  listing_type: 'sale';
  price: string;
  product_condition: ProductCondition;
  is_negotiable: boolean;
}
