/**
 * Constants for authentication-related cookie names
 * @constant
 * @type {Object}
 * @property {string} ACCESS_TOKEN - Cookie name for storing the access token
 * @property {string} REFRESH_TOKEN - Cookie name for storing the refresh token
 */
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
} as const;
