import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { UserLocation } from '@/types/user';
import { apiRequest } from '@/lib/api/core/client';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

/**
 * Fetches the authenticated user's location from the API.
 * @returns {Promise<Result<UserLocation | null>>} A Result containing the user's location or an error.
 */
export async function fetchUserLocation(): Promise<
  Result<UserLocation | null>
> {
  return tryCatch(
    (async () => {
      const token = getClientCookie('auth-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('users/location'), {
        method: 'GET',
        headers: createAuthHeaders(token),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't have a location set
          return null;
        }
        throw new Error('Failed to fetch user location');
      }

      return await response.json();
    })(),
  );
}

interface UpdateLocationRequest {
  address: string;
  latitude: number;
  longitude: number;
}

export async function updateUserLocation(
  data: UpdateLocationRequest,
): Promise<Result<void>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      return apiRequest<void>({
        method: 'POST',
        endpoint: 'users/location/update',
        token: accessToken,
        body: data,
      });
    })(),
  );
}
