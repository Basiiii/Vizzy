/**
 * Cache key constants for listing-related data
 */
export const LISTING_CACHE_KEYS = {
  /**
   * Generates a cache key for a listing's details
   * @param listingId - The unique identifier of the listing
   * @returns Cache key string for listing details
   */
  DETAIL: (listingId: number): string => `listing:${listingId}`,

  /**
   * Generates a cache key for a listing's images
   * @param listingId - The unique identifier of the listing
   * @returns Cache key string for listing images
   */
  IMAGES: (listingId: number): string => `listing:${listingId}:images`,

  /**
   * Generates a cache key for paginated listings by user
   * @param userid - The user's unique identifier
   * @param page - The page number
   * @param limit - The number of items per page
   * @returns Cache key string for paginated user listings
   */
  PAGINATED_BY_USER: (userid: string, page: number, limit: number): string =>
    `listing:by-user:${userid}:page:${page}:limit:${limit}`,

  /**
   * Generates a cache key for home page listings with filters
   * @param page - The page number
   * @param limit - The number of items per page
   * @param type - Optional listing type filter
   * @param search - Optional search query
   * @param lat - Optional latitude for location-based search
   * @param lon - Optional longitude for location-based search
   * @param dist - Optional distance radius for location-based search
   * @returns Cache key string for filtered home listings
   */
  HOME: (
    page: number,
    limit: number,
    type?: string,
    search?: string,
    lat?: number,
    lon?: number,
    dist?: number,
  ): string =>
    `listing:home:page:${page}:limit:${limit}:type:${type || 'all'}:search:${
      search || 'none'
    }:lat:${lat || 'none'}:lon:${lon || 'none'}:dist:${dist || 'none'}`,
} as const;
