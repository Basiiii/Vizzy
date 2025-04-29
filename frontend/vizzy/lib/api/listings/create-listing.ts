import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { CreateListingDto } from '@/types/create-listing';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function createListing(
  createListing: CreateListingDto,
): Promise<Result<number>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      console.log('Sending create listing request with data:', createListing);

      const response = await apiRequest<number>({
        method: 'POST',
        endpoint: 'listings',
        token: accessToken,
        body: createListing,
      });

      // Log the raw response
      console.log('Raw response from create listing:', response);
      console.log('Response type:', typeof response);

      // The response is the ID itself
      if (typeof response !== 'number') {
        console.error('Invalid response from server:', response);
        throw new Error('Invalid response from server: expected a number');
      }

      return response;
    })(),
  );
}
