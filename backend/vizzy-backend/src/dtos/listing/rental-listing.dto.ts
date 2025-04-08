import { Listing } from './listing.dto';

export interface RentalListing extends Listing {
  listing_type: 'rental';
  deposit_required?: boolean;
  cost_per_day: string;
  auto_close_date?: string; // ISO date string
  rental_duration_limit?: number; // in days
  late_fee?: string;
}
