/**
 * Type definition for authentication key strings.
 * Represents the possible keys used for authentication tokens.
 */
export type AuthKey = 'AUTH_TOKEN' | 'REFRESH_TOKEN';

/**
 * Object containing authentication token keys and their corresponding storage identifiers.
 * @property {string} AUTH_TOKEN - The key used to store the main authentication token
 * @property {string} REFRESH_TOKEN - The key used to store the refresh token
 */
export const AUTH: Record<AuthKey, string> = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
};
