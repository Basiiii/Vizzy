/**
 * Cache key constants for favorite-related data
 */
export const FAVORITE_CACHE_KEYS = {
  /**
   * Generates a cache key for a user's favorite listings
   * @param userId - The unique identifier of the user
   * @returns Cache key string for the user's favorite listings
   */
  LIST_BY_USER: (userId: string): string => `favorite:by-user:${userId}`,

  /**
   * Generates a cache key to check if a listing is favorited by a user
   * @param userId - The unique identifier of the user
   * @param listingId - The unique identifier of the listing
   * @returns Cache key string to verify favorite status
   */
  IS_FAVORITE: (userId: string, listingId: number): string =>
    `favorite:is:${userId}:${listingId}`,
} as const;
