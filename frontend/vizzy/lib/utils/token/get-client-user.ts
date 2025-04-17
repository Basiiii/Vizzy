import { ProfileMetadata } from '@/types/profile';
import { getClientCookie } from '../cookies/get-client-cookie';
import { decodeToken } from './decode-token';
import { JwtPayload } from '@/types/jwt-payload';

/**
 * Retrieves the user's profile metadata from a JWT (JSON Web Token) stored in the browser's cookies.
 * This function is intended to be used in client-side environments and will return `null`
 * if executed in a non-browser context (e.g., server-side rendering) or if the token is not found.
 *
 * @returns {ProfileMetadata | null} - The user's profile metadata extracted from the JWT payload if the token exists and is valid,
 *                                     or `null` if the token is missing, invalid, or if the function is executed outside a browser environment.
 *
 * @example
 * // Assuming a valid JWT with user metadata is stored in the "auth-token" cookie
 * const user = getClientUser();
 * console.log(user); // Output: { id: "123", email: "user@example.com", name: "John Doe", username: "johndoe" }
 *
 * @example
 * // If the token is missing or the function is run server-side
 * const user = getClientUser();
 * console.log(user); // Output: null
 */
export function getClientUser(): ProfileMetadata | null {
  if (typeof document === 'undefined') return null; // Ensure it's running in the browser

  // Get JWT token from cookies
  const token: string | null = getClientCookie('authToken');
  if (token == null) {
    return null;
  }

  // Get token payload data
  const tokenData: JwtPayload = decodeToken(token);

  // Create the profile metadata object
  const profileMetadata: ProfileMetadata = {
    id: tokenData.user_metadata.sub,
    email: tokenData.user_metadata.email,
    name: tokenData.user_metadata.name,
    username: tokenData.user_metadata.username,
  };

  // Return user profile metadata
  return profileMetadata;
}
