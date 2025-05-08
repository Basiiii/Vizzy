/**
 * Cache key constants for proposal-related data
 */
export const PROPOSAL_CACHE_KEYS = {
  /**
   * Gets cache key for all proposals associated with a user's profile
   * @param userid - The user's ID
   * @returns Cache key string
   */
  ALL: (userid: string): string => `user:${userid}:profile-proposals`,

  /**
   * Gets cache key for detailed proposal information
   * @param proposalId - The proposal's ID
   * @returns Cache key string
   */
  DETAIL: (proposalId: string): string => `proposal:${proposalId}`,

  /**
   * Gets cache key for proposals sent by a user
   * @param userid - The user's ID
   * @returns Cache key string
   */
  SENT: (userid: string): string => `user:${userid}:sent-proposals`,

  /**
   * Gets cache key for proposals received by a user
   * @param userid - The user's ID
   * @returns Cache key string
   */
  RECEIVED: (userid: string): string => `user:${userid}:received-proposals`,

  /**
   * Gets cache key for proposal images
   * @param proposalId - The proposal's ID
   * @returns Cache key string
   */
  IMAGES: (proposalId: number): string => `proposal:${proposalId}:images`,

  /**
   * Gets cache key for proposals by a specific user
   * @param userid - The user's ID
   * @returns Cache key string
   */
  BY_USER: (userid: string): string => `proposal:by-user:${userid}`,

  /**
   * Gets cache key for proposals sent by a specific user
   * @param userid - The user's ID
   * @returns Cache key string
   */
  SENT_BY_USER: (userid: string): string => `proposal:sent:by-user:${userid}`,

  /**
   * Gets cache key for proposals received by a specific user
   * @param userid - The user's ID
   * @returns Cache key string
   */
  RECEIVED_BY_USER: (userid: string): string =>
    `proposal:received:by-user:${userid}`,

  /**
   * Gets cache key for filtered proposal list
   * @param userId - The user's ID
   * @param optionsHash - Hash of filter options
   * @returns Cache key string
   */
  FILTERED_LIST: (userId: string, optionsHash: string): string =>
    `user:${userId}:proposals:${optionsHash}`,

  /**
   * Gets cache key for user's proposal balance
   * @param userId - The user's ID
   * @returns Cache key string
   */
  BALANCE: (userId: string): string => `user:${userId}:proposal-balance`,
} as const;
