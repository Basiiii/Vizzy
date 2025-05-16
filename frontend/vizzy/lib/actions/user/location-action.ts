'use client';

import { getApiUrl } from '@/lib/api/core/client';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { UserLocation } from '@/types/user';

/**
 * Fetches the authenticated user's location from the API using server actions.
 * @returns {Promise<Result<UserLocation | null>>} A Result containing the user's location or an error.
 */
export async function getUserLocationAction(): Promise<Result<UserLocation | null>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('users/location'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
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

/**
 * Updates the authenticated user's location using server actions.
 * @param data - The location data to update
 * @returns {Promise<Result<void>>} A Result indicating success or failure
 */
export async function updateUserLocationAction(
  data: UpdateLocationRequest,
): Promise<Result<void>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('users/location'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update user location');
      }
    })(),
  );
}
