'use server';

import { cookies } from 'next/headers';
import { AUTH } from '@/lib/constants/auth';
import { decodeToken } from '@/lib/utils/token/decode-token'; // Adjust path if needed
import { JwtPayload } from '@/types/jwt-payload'; // Adjust path if needed
import { ProfileMetadata } from '@/types/profile'; // Import ProfileMetadata

/**
 * Server action to retrieve the authentication token from cookies,
 * decode it, and return the user's profile metadata.
 *
 * @returns {Promise<ProfileMetadata | null>} The user's profile metadata if the token exists and is valid, otherwise null.
 */
export async function getUserMetadataAction(): Promise<ProfileMetadata | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(AUTH.AUTH_TOKEN)?.value;

    if (!accessToken) {
      console.log('[GetUserMetadataAction] No access token found in cookies.');
      return null;
    }

    // Decode the token
    const decodedPayload: JwtPayload | null = decodeToken(accessToken);

    if (!decodedPayload || !decodedPayload.user_metadata) {
      console.error(
        '[GetUserMetadataAction] Failed to decode token or user_metadata missing.',
      );
      return null;
    }

    // Extract data and construct ProfileMetadata
    const { sub, email, name, username } = decodedPayload.user_metadata;

    // Ensure all required fields are present (optional, but good practice)
    if (!sub || !email || !name || !username) {
       console.error('[GetUserMetadataAction] Missing required fields in user_metadata.');
       return null;
    }

    const profileMetadata: ProfileMetadata = {
      id: sub,
      email: email,
      name: name,
      username: username,
    };

    return profileMetadata;
  } catch (error) {
    console.error('[GetUserMetadataAction] Error processing token:', error);
    return null; // Return null on any error during processing
  }
}
