import { ProfileInformation } from '@/types/temp';

// Function to fetch the user's avatar URL
export async function fetchAvatar(): Promise<string> {
  // In a real app, this would be an API call to your backend
  try {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return a placeholder avatar URL for demonstration
    return '/placeholder.svg';
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return '/placeholder.svg'; // Fallback to default avatar
  }
}

// Function to fetch the user's profile information
export async function fetchProfileInfo(): Promise<ProfileInformation> {
  // In a real app, this would be an API call to your backend
  try {
    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return mock profile data
    return {
      username: 'johndoe',
      name: 'John Doe',
      email: 'john.doe@example.com',
      location: 'San Francisco, CA',
      avatarUrl: '/placeholder.svg',
    };
  } catch (error) {
    console.error('Error fetching profile info:', error);
    // Return default profile data in case of error
    return {
      username: '',
      name: '',
      email: '',
      location: '',
      avatarUrl: '/placeholder.svg',
    };
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
