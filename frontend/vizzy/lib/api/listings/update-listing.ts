import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { CreateListingDto } from '@/types/create-listing';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import { Listing } from '@/types/listing';
export async function updateListing(
  updateListing: CreateListingDto,
): Promise<Result<Listing>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      console.log('Sending update listing request with data:', updateListing);

      const response = await apiRequest<Listing>({
        method: 'PATCH',
        endpoint: `listings/${updateListing.id}`,
        token: accessToken,
        body: updateListing,
      });

      console.log('Raw response from update listing:', response);
      console.log('Response type:', typeof response);
      return response as Listing;
    })(),
  );
}
