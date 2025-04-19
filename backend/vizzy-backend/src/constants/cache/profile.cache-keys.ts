/**
 * Cache key constants for profile-related data
 * @constant
 */
export const PROFILE_CACHE_KEYS = {
  /**
   * Generates a cache key for a user's profile details
   * @param {string} username - The username of the profile
   * @returns {string} The cache key in format 'profile:{username}'
   */
  DETAIL: (username: string): string => `profile:${username}`,
  DETAIL: (userId: string): string => `profile:${userId}`,
} as const;
