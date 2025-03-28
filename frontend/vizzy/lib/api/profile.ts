import { Profile } from '@/types/profile';
import { ProfileInformation } from '@/types/temp';

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
  // In a real app, this would upload the file to your backend/storage
  try {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Normally, the server would return the URL of the uploaded image
    // For demo purposes, we'll create a local object URL
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw new Error('Failed to update avatar');
  }
}

// Function to update the user's profile information
export async function updateProfileInfo(
  profile: Partial<ProfileInformation>,
): Promise<ProfileInformation> {
  // In a real app, this would be an API call to your backend
  try {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return the updated profile (in a real app, this would come from the server)
    return {
      username: profile.username || 'johndoe',
      name: profile.name || 'John Doe',
      email: profile.email || 'john.doe@example.com',
      location: profile.location || 'San Francisco, CA',
      avatarUrl: profile.avatarUrl || '/placeholder.svg',
    };
  } catch (error) {
    console.error('Error updating profile info:', error);
    throw new Error('Failed to update profile information');
  }
}
