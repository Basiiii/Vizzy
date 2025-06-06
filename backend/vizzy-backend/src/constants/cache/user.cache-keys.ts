/**
 * Cache key constants for user-related data
 */
export const USER_CACHE_KEYS = {
  /**
   * Generates a cache key for user details
   * @param userId - The unique identifier of the user
   * @returns Cache key string in format 'user:{userId}'
   */
  DETAIL: (userId: string): string => `user:${userId}`,

  /**
   * Generates a cache key for looking up users by username
   * @param username - The username to lookup
   * @returns Cache key string in format 'user:by-username:{username}'
   */
  LOOKUP: (username: string): string => `user:by-username:${username}`,

  /**
   * Generates a cache key for user location data
   * @param userId - The unique identifier of the user
   * @returns Cache key string in format 'user:{userId}:location'
   */
  LOCATION: (userId: string): string => `user:${userId}:location`,

  /**
   * Generates a cache key for user blocks
   * @param userId - The unique identifier of the user
   * @returns Cache key string in format 'user:{userId}:blocks'
   */
  BLOCKS: (userId: string): string => `user:${userId}:blocks`,

  /**
   * Generates a cache key for checking if a user has blocked another user
   * @param userId - The unique identifier of the user checking the block
   * @param targetUserId - The unique identifier of the user being checked
   * @returns Cache key string in format 'user:{userId}:block-status:{targetUserId}'
   */
  BLOCK_STATUS: (userId: string, targetUserId: string): string =>
    `user:${userId}:block-status:${targetUserId}`,
} as const;
