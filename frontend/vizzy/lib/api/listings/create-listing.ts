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

      return apiRequest<number>({
        method: 'POST',
        endpoint: 'listings',
        token: accessToken,
        body: createListing,
      });
    })(),
  );
}
