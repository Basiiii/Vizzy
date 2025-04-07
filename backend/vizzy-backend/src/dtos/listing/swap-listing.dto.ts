import { Listing } from './listing.dto';

export interface SwapListing extends Listing {
  listing_type: 'swap';
  desired_item: string;
}
