export const PROFILE_CACHE_KEYS = {
  DETAIL: (username: string): string => `profile:${username}`,
} as const;
