import { ProfileMetadata } from '@/types/profile';
import { decodeToken } from './decode-token';
import { JwtPayload } from '@/types/jwt-payload';
import { getServerCookie } from '../cookies/get-server-cookie';

/**
 * Retrieves the user's profile metadata from a JWT (JSON Web Token) stored in the server-side cookies.
 * This function is intended to be used in server-side environments (e.g., Next.js API routes or server components).
 *
 * @returns {Promise<ProfileMetadata | null>} - A promise that resolves to the user's profile metadata extracted from the JWT payload
 *                                              if the token exists and is valid, or `null` if the token is missing or invalid.
 *
 * @example
 * // Assuming a valid JWT with user metadata is stored in the "auth-token" cookie
 * const user = await getServerUser();
 * console.log(user); // Output: { id: "123", email: "user@example.com", name: "John Doe", username: "johndoe" }
 *
 * @example
 * // If the token is missing or invalid
 * const user = await getServerUser();
 * console.log(user); // Output: null
 */
export async function getServerUser(): Promise<ProfileMetadata | null> {
  // Get JWT token from cookies
  const token: string | null = await getServerCookie('authToken');
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
