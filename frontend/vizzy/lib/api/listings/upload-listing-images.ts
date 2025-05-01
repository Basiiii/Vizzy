import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import type { ListingImagesResponseDto } from '@/types/listing-images';

export async function uploadListingImages(
  listingId: number,
  images: File[],
): Promise<Result<string | null>> {
  console.log('Uploading images:', listingId);
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      if (images.length === 0) {
        return null;
      }

      const formData = new FormData();
      images.forEach((image) => {
        formData.append('files', image, image.name);
      });

      const result = await apiRequest<ListingImagesResponseDto>({
        method: 'POST',
        endpoint: `listings/${listingId}/images`,
        token: accessToken,
        body: formData,
        headers: {}, // Let apiRequest handle content-type for FormData
      });

      return result.images && result.images.length > 0
        ? result.images[0].url
        : null;
    })(),
  );
}
