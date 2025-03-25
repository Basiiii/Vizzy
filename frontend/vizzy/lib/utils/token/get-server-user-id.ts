import { getServerCookie } from '../cookies/get-server-cookie';
import { decodeToken } from './decode-token';
import { JwtPayload } from '@/types/jwt-payload';

/**
 * Retrieves the user ID from a JWT (JSON Web Token) stored in the server-side cookies.
 * This function is intended to be used in server-side environments (e.g., Next.js API routes or server components).
 *
 * @returns {Promise<string | null>} - A promise that resolves to the user ID extracted from the JWT payload
 *                                     if the token exists and is valid, or `null` if the token is missing or invalid.
 *
 * @example
 * // Assuming a valid JWT with a `sub` (subject) field is stored in the "auth-token" cookie
 * const userId = await getServerUserId();
 * console.log(userId); // Output: "123" (if the token exists and contains a valid user ID)
 *
 * @example
 * // If the token is missing or invalid
 * const userId = await getServerUserId();
 * console.log(userId); // Output: null
 */
export async function getServerUserId(): Promise<string | null> {
  // Get JWT token from cookies
  const token: string | null = await getServerCookie('auth-token');
  if (token == null) {
    return null;
  }

  // Get token payload data
  const tokenData: JwtPayload = decodeToken(token);

  // Return user ID
  return tokenData.sub;
}
