/**
 * Cache key constants for contact-related data
 */
export const CONTACT_CACHE_KEYS = {
  /**
   * Generates a cache key for retrieving contact details
   * @param contactId - Unique identifier of the contact
   * @returns Formatted cache key string for contact details
   */
  DETAIL: (contactId: string): string => `contact:${contactId}`,

  /**
   * Generates a cache key for retrieving contacts by user
   * @param userId - Unique identifier of the user
   * @returns Formatted cache key string for user's contacts
   */
  BY_USER: (userId: string): string => `contact:by-user:${userId}`,
} as const;
