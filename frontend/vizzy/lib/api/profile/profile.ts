import { Profile, ProfileInformation } from '@/types/profile';
import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { AUTH } from '@/lib/constants/auth';

/**
 * Fetches a user's profile data from the server
 */
export async function fetchUserProfile(username: string): Promise<Profile> {
  try {
    const response = await fetch(getApiUrl(`profile?username=${username}`));

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile information');
  }
}

/**
 * Updates the user's avatar
 */
export async function updateAvatar(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = getClientCookie(AUTH.AUTH_TOKEN);
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(getApiUrl('profile/avatar'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    const data = await response.json();
    return data.avatarUrl;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
}

/**
 * Updates the user's profile information
 */
export async function updateProfileInfo(
  data: ProfileInformation,
): Promise<void> {
  const token = getClientCookie(AUTH.AUTH_TOKEN);
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(getApiUrl('profile/update'), {
    method: 'POST',
    headers: {
      ...createAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
}
