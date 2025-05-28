export const FAVORITES_CACHE_KEYS = {
  /**
   * Get the cache key for a user's favorites list
   * @param userId - The ID of the user
   * @param limit - Number of items to return
   * @param offset - Number of items to skip
   * @returns string
   */
  USER_LIST: (userId: string, limit?: number, offset?: number): string =>
    `favorites:user:${userId}:list:${limit || 10}:${offset || 0}`,
} as const;
