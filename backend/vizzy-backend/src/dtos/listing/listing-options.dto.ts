export interface ListingOptionsDto {
  limit: number;
  offset: number;
  latitude?: number;
  longitude?: number;
  distance?: number; // distance in meters
}
