import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import type { ListingImagesResponseDto } from '@/types/listing-images';

export async function uploadListingImages(
  listingId: number,
  images: File[],
  imagesToDelete?: string[],
): Promise<Result<string | null>> {
  console.log('Uploading images:', listingId);
  return tryCatch(
    (async () => {
      if (!listingId || typeof listingId !== 'number') {
        throw new Error('Invalid listing ID provided');
      }

      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();

      if (images.length > 0) {
        images.forEach((image) => {
          formData.append('files', image);
        });
      }

      if (imagesToDelete && imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      console.log('Uploading images:', {
        newImages: images.length,
        imagesToDelete: imagesToDelete?.length || 0,
      });
      console.log('FormData entries:', Array.from(formData.entries()));

      const result = await apiRequest<ListingImagesResponseDto>({
        method: 'POST',
        endpoint: `listings/${listingId}/images`,
        token: accessToken,
        body: formData,
        headers: {},
      });

      return result.images && result.images.length > 0
        ? result.images[0].url
        : null;
    })(),
  );
}
