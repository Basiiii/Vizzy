import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';

/**
 * User location data returned from the API
 */
export interface UserLocation {
  id: number;
  full_address: string;
  lat: number;
  lon: number;
  created_at: string;
}

/**
 * Fetches the authenticated user's location from the API
 *
 * @returns Promise with the user's location data
 */
export async function fetchUserLocation(): Promise<UserLocation | null> {
  try {
    // Get the auth token from cookies
    const token = getClientCookie('auth-token');

    if (!token) {
      console.error('No authentication token found');
      return null;
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
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
}
