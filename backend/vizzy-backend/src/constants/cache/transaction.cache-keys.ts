export const TRANSACTION_CACHE_KEYS = {
  BY_USER: (userId: string, limit: number, offset: number): string =>
    `transaction:by-user:${userId}:limit:${limit}:offset:${offset}`,
  TOTAL_VALUE: (userId: string): string =>
    `transaction:total-value:by-user:${userId}`,
} as const;
