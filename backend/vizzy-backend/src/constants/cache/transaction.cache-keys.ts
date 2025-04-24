/**
 * Cache key constants for transaction-related data
 */
export const TRANSACTION_CACHE_KEYS = {
  /**
   * Generates a cache key for retrieving transactions by user with pagination
   * @param userId - The ID of the user
   * @param limit - The maximum number of transactions to retrieve
   * @param offset - The number of transactions to skip
   * @returns A formatted cache key string
   */
  BY_USER: (userId: string, limit: number, offset: number): string =>
    `transaction:by-user:${userId}:limit:${limit}:offset:${offset}`,

  /**
   * Generates a cache key for retrieving the total transaction value for a user
   * @param userId - The ID of the user
   * @returns A formatted cache key string
   */
  TOTAL_VALUE: (userId: string): string =>
    `transaction:total-value:by-user:${userId}`,
} as const;
