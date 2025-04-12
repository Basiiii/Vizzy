import { createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { ListingImageDto } from '@/types/listing-images';

/**
 * Fecthes images for a specific listing
 * @param listingId - The ID of the listing to import images from
 * @returns Promise that resolves when download is complete
 */
export async function fetchListingImages(
  listingId: number,
): Promise<ListingImageDto[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = createAuthHeaders(token);

  const response = await fetch(
    `${API_URL}/${API_VERSION}/listings/${listingId}/images`,
    {
      method: 'GET',
      headers: headers,
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch listing images: ${response.statusText}`);
  }
  const data = await response.json();
  return data.images;
}
