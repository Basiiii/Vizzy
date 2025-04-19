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

  const response = await fetch(
    `${API_URL}/${API_VERSION}/listings/${listingId}/images`,
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch listing images: ${response.statusText}`);
  }
  const data = await response.json();
  return data.images;
}
