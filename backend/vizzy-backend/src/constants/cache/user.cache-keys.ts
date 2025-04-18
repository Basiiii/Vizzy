export const USER_CACHE_KEYS = {
  DETAIL: (userId: string): string => `user:${userId}`,
  LOOKUP: (username: string): string => `user:by-username:${username}`,
  LOCATION: (userId: string): string => `user:${userId}:location`,
  BLOCKS: (userId: string): string => `user:${userId}:blocks`,
} as const;
