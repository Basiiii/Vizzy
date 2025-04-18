export const CONTACT_CACHE_KEYS = {
  DETAIL: (contactId: string): string => `contact:${contactId}`,
  BY_USER: (userId: string): string => `contact:by-user:${userId}`,
} as const;
