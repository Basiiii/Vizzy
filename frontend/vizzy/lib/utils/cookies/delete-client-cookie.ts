/**
 * Deletes a specified cookie on the client side by setting its expiration to a past date.
 * This function is intended for browser environments and will have no effect if executed server-side.
 *
 * @param {string} name - The name of the cookie to delete
 * @param {Object} [options] - Optional cookie deletion settings
 * @param {string} [options.path='/'] - The path from which the cookie will be accessible
 * @param {string} [options.domain] - The domain from which the cookie will be accessible
 * @param {boolean} [options.secure] - Whether the cookie requires a secure connection
 * @param {'Strict' | 'Lax' | 'None'} [options.sameSite] - SameSite attribute of the cookie
 *
 * @example
 * // Delete a cookie with default path
 * deleteClientCookie('sessionId');
 *
 * @example
 * // Delete a cookie with specific options
 * deleteClientCookie('prefs', { path: '/settings', domain: 'example.com' });
 */
export function deleteClientCookie(
  name: string,
  options?: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  },
): void {
  if (typeof document === 'undefined') return;

  const { path = '/', domain, secure, sameSite } = options || {};

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path};`;

  if (domain) {
    cookieString += ` domain=${domain};`;
  }

  if (secure) {
    cookieString += ' secure;';
  }

  if (sameSite) {
    cookieString += ` SameSite=${sameSite};`;
  }

  document.cookie = cookieString;
}
