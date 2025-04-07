import { Listing } from './listing.dto';

export interface GiveawayListing extends Listing {
  listing_type: 'giveaway';
  recipient_requirements?: string;
}
