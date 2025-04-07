import { RentalListing } from './rental-listing.dto';
import { SaleListing } from './sale-listing.dto';
import { SwapListing } from './swap-listing.dto';
import { GiveawayListing } from './giveaway-listing.dto';

export type ListingUnion =
  | RentalListing
  | SaleListing
  | SwapListing
  | GiveawayListing;
