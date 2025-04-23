import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { ListingImageDto } from '@/types/listing-images';

export async function fetchListingImages(
  listingId: number,
): Promise<Result<ListingImageDto[]>> {
  return tryCatch(
    (async () => {
      const response = await apiRequest<{ images: ListingImageDto[] }>({
        method: 'GET',
        endpoint: `listings/${listingId}/images`,
      });
      console.log(response);
      return response.images;
    })(),
  );
}
