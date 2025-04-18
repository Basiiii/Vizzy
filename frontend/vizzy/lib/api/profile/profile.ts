import { Profile, ProfileInformation } from '@/types/profile';
import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { AUTH } from '@/lib/constants/auth';
import { tryCatch, type Result } from '@/lib/utils/try-catch';

/**
 * Fetches a user's profile data from the server.
 * @param {string} username - The username of the user whose profile to fetch.
 * @returns {Promise<Result<Profile>>} A Result containing the profile or an error.
 */
export async function fetchUserProfile(
  username: string,
): Promise<Result<Profile>> {
  return tryCatch(
    (async () => {
      const response = await fetch(getApiUrl(`profile?username=${username}`));
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json() as Promise<Profile>;
    })(),
  );
}

/**
 * Updates the user's profile information.
 * @param {ProfileInformation} data - The profile information to update.
 * @returns {Promise<Result<void>>} A Result indicating success or an error.
 */
export async function updateProfileInfo(
  data: ProfileInformation,
): Promise<Result<void>> {
  return tryCatch(
    (async () => {
      const token = getClientCookie(AUTH.AUTH_TOKEN);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('profile/update'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return undefined;
    })(),
  );
}
