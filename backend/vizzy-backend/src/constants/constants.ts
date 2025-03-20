export const CACHE_KEYS = {
  USERNAME_LOOKUP: (username: string): string => `user:${username}:id`,
  BASIC_USER_INFO: (userid: string): string => `user:${userid}:basic-info`,
  USER_ACCOUNT_INFO: (userid: string): string => `user:${userid}:account-info`,
  PROFILE_INFO: (username: string): string => `user:${username}:profile-info`,
  PROFILE_LISTINGS: (userid: string): string =>
    `user:${userid}:profile-listings`,
};

export const VERIFICATION_THRESHOLD = 10; // Number of listings required for verification
