'use client';
import { ProfileMetadata } from '@/types/profile';
import { decodeToken } from './decode-token';
import { JwtPayload } from '@/types/jwt-payload';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

/**
 * Retrieves the user's profile metadata from a JWT (JSON Web Token) using server actions.
 * This function is intended to be used in both client and server environments as it uses
 * server actions to securely access cookies.
 *
 * @returns {Promise<ProfileMetadata | null>} - A promise that resolves to the user's profile metadata
 *                                             extracted from the JWT payload if the token exists and is valid,
 *                                             or `null` if the token is missing or invalid.
 *
 * @example
 * // Using the server action to get user data
 * const user = await getUserAction();
 * console.log(user); // Output: { id: "123", email: "user@example.com", name: "John Doe", username: "johndoe" }
 *
 * @example
 * // If no valid token exists
 * const user = await getUserAction();
 * console.log(user); // Output: null
 */
export async function getUserAction(): Promise<ProfileMetadata | null> {
  // Get JWT token using server action
  const { accessToken } = await getAuthTokensAction();
  if (!accessToken) {
    return null;
  }

  // Get token payload data
  const tokenData: JwtPayload = decodeToken(accessToken);

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
