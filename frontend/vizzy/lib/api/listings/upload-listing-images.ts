//import { createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import type { ListingImagesResponseDto } from '@/types/listing-images'; // Import the response DTO type

/**
 * Uploads images for a specific listing
 * @param listingId - The ID of the listing to upload images for
 * @param images - Array of image files to upload
 * @returns Promise that resolves with the URL of the first uploaded image, or null if no images were uploaded or response is invalid
 */
export async function uploadListingImages(
  listingId: number,
  images: File[],
): Promise<string | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  if (images.length === 0) {
    return null;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const formData = new FormData();

  images.forEach((image) => {
    formData.append(`files`, image, image.name);
  });

  const response = await fetch(
    `${API_URL}/${API_VERSION}/listings/${listingId}/images`,
    {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: formData,
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Upload failed response:', errorBody);
    throw new Error(`Failed to upload listing images: ${response.statusText}`);
  }

  try {
    const result: ListingImagesResponseDto = await response.json();
    if (result.images && result.images.length > 0) {
      return result.images[0].url;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse upload response:', e);
    throw new Error('Failed to parse image upload response.');
  }
}
