/**
 * Deletes a cookie on the server side by setting appropriate response headers.
 * Compatible with Next.js middleware (NextResponse) and API routes.
 *
 * @param {string} name - The name of the cookie to delete
 * @param {Object} response - The server response object
 * @param {Object} [options] - Optional cookie deletion settings
 * @param {string} [options.path='/'] - Path requirement for the cookie
 * @param {string} [options.domain] - Domain requirement for the cookie
 * @param {boolean} [options.secure] - Secure flag requirement
 * @param {'Strict' | 'Lax' | 'None'} [options.sameSite] - SameSite attribute
 *
 * @example
 * // In Next.js middleware
 * import { NextResponse } from 'next/server';
 *
 * export function middleware() {
 *   const response = NextResponse.next();
 *   deleteServerCookie('session', response, { path: '/' });
 *   return response;
 * }
 *
 * @example
 * // In API route (app router)
 * export async function GET(request: Request) {
 *   const response = new Response();
 *   deleteServerCookie('prefs', response, { path: '/settings' });
 *   return response;
 * }
 */
export function deleteServerCookie(
  name: string,
  response: { headers: Headers },
  options?: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  },
): void {
  const { path = '/', domain, secure, sameSite } = options || {};

  let cookieString = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;

  if (domain) cookieString += ` Domain=${domain};`;
  if (secure) cookieString += ' Secure;';
  if (sameSite) cookieString += ` SameSite=${sameSite};`;

  // For HTTP cookies, add the HttpOnly flag
  cookieString += ' HttpOnly;';

  response.headers.append('Set-Cookie', cookieString);
}
