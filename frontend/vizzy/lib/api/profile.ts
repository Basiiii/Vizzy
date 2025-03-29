import { Profile, ProfileInformation } from '@/types/profile';
import { getClientCookie } from '../utils/cookies/get-client-cookie';
import { AUTH } from '../constants/auth';

export async function fetchProfileInfo(username: string): Promise<Profile> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    const response = await fetch(
      `${API_URL}/${API_VERSION}/profile?username=${username}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching profile info:', error);
    throw new Error('Failed to fetch profile information');
  }
}

// Function to update the user's avatar
export async function updateAvatar(file: File): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    // Get the JWT token from cookies
    const token = getClientCookie('auth-token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Make the API call
    const response = await fetch(`${API_URL}/${API_VERSION}/profile/avatar`, {
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

// Function to update the user's profile information
export async function updateProfileInfo(
  data: ProfileInformation,
): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie(AUTH.AUTH_TOKEN);

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}/${API_VERSION}/profile/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
}
