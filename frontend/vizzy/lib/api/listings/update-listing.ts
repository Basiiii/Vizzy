import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import { UpdateListingDto } from '@/types/update-listing';

export async function updateListing(
  data: UpdateListingDto,
): Promise<Result<void>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      console.log(
        `Sending update listing request for ID ${data.listingId} with data:`,
        data,
      );

      const response = await apiRequest<void>({
        method: 'PATCH',
        endpoint: `listings/${data}`,
        token: accessToken,
        body: data,
      });

      console.log('Raw response from update listing:', response);
      console.log('Response type:', typeof response);

      return response;
    })(),
  );
}
