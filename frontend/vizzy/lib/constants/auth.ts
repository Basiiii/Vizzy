// constants/auth.ts
export type AuthKey = 'AUTH_TOKEN' | 'REFRESH_TOKEN';

export const AUTH: Record<AuthKey, string> = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
};
