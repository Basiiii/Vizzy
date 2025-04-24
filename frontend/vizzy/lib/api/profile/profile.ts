import { Profile, ProfileInformation } from '@/types/profile';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { apiRequest, getApiUrl } from '../core/client';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

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
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      await apiRequest<void, ProfileInformation>({
        method: 'POST',
        endpoint: 'profile/update',
        token: accessToken,
        body: data,
      });

      return undefined;
    })(),
  );
}
