import { Profile } from '@/types/profile';

/**
 * Fetches a user's profile data from the server
 *
 * @param {string} username - The username of the profile to fetch
 * @returns {Promise<Profile>} A promise that resolves to the user's profile data
 * @throws {Error} Throws an error if the fetch request fails
 *
 * @example
 * try {
 *   const profile = await fetchUserProfile('johndoe');
 *   console.log(profile);
 * } catch (error) {
 *   console.error('Error fetching profile:', error);
 * }
 */
export async function fetchUserProfile(username: string): Promise<Profile> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

  if (!API_URL || !API_VERSION)
    throw new Error('API_URL or API_VERSION is not defined');

  const response = await fetch(
    `${API_URL}/${API_VERSION}/profile?username=${username}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return response.json();
}
