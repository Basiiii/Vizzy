export const CACHE_KEYS = {
  BASIC_USER_INFO: (userId: string): string => `user:${userId}:basic-info`,
  USER_ACCOUNT_INFO: (userId: string): string => `user:${userId}:account-info`,
};
