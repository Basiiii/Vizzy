export const CACHE_KEYS = {
  USERNAME_LOOKUP: (username: string): string => `user:${username}:id`,
  BASIC_USER_INFO: (userId: string): string => `user:${userId}:basic-info`,
  USER_ACCOUNT_INFO: (userId: string): string => `user:${userId}:account-info`,
  PROFILE_INFO: (username: string): string => `user:${username}:profile-info`,
};

export const VERIFICATION_THRESHOLD = 10; // Number of listings required for verification
