import { getClientCookie } from '../cookies/get-client-cookie';
import { decodeToken } from './decode-token';
import { JwtPayload } from '@/types/jwt-payload';

/**
 * Retrieves the user ID from a JWT (JSON Web Token) stored in the browser's cookies.
 * This function is intended to be used in client-side environments and will return `null`
 * if executed in a non-browser context (e.g., server-side rendering) or if the token is not found.
 *
 * @returns {string | null} - The user ID extracted from the JWT payload if the token exists and is valid,
 *                            or `null` if the token is missing, invalid, or if the function is executed
 *                            outside a browser environment.
 *
 * @example
 * // Assuming a valid JWT with a `sub` (subject) field is stored in the "auth-token" cookie
 * const userId = getClientUserId();
 * console.log(userId); // Output: "123" (if the token exists and contains a valid user ID)
 *
 * @example
 * // If the token is missing or the function is run server-side
 * const userId = getClientUserId();
 * console.log(userId); // Output: null
 */
export function getClientUserId(): string | null {
  if (typeof document === 'undefined') return null; // Ensure it's running in the browser

  // Get JWT token from cookies
  const token: string | null = getClientCookie('authToken');
  if (token == null) {
    return null;
  }

  // Get token payload data
  const tokenData: JwtPayload = decodeToken(token);

  // Return user ID
  return tokenData.sub;
}
