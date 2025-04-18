import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';

/**
 * Updates the main image URL for a specific listing
 * @param listingId - The ID of the listing to update
 * @param imageUrl - The URL of the main image
 * @returns Promise that resolves when update is complete
 */
export async function updateListingImageUrl(
  listingId: number,
  imageUrl: string,
): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(
    `${API_URL}/${API_VERSION}/listings/${listingId}/image-url`,
    {
      method: 'PATCH',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({ imageUrl }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Update image URL failed response:', errorBody);
    throw new Error(
      `Failed to update listing image URL: ${response.statusText}`,
    );
  }

  // No content expected on successful PATCH, but you can log success
  console.log(`Successfully updated image URL for listing ${listingId}`);
}
