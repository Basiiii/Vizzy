export const CACHE_KEYS = {
  USERNAME_LOOKUP: (username: string): string => `user:${username}:id`,
  BASIC_USER_INFO: (userid: string): string => `user:${userid}:basic-info`,
  USER_ACCOUNT_INFO: (userid: string): string => `user:${userid}:account-info`,
  PROFILE_INFO: (username: string): string => `user:${username}:profile-info`,
  PROFILE_LISTINGS: (userid: string): string =>
    `user:${userid}:profile-listings`,
  USER_CONTACTS: (userid: string): string => `user:${userid}:contacts`,
  FORWARD_GEOCODING: (address: string): string =>
    `geocoding:forward:${address}`,
  REVERSE_GEOCODING: (lat: number, lon: number): string =>
    `geocoding:reverse:${lat}:${lon}`,
};
