import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function removeFavorite(listingId: number): Promise<Result<void>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      return apiRequest<void>({
        method: 'DELETE',
        endpoint: `favorites/${listingId}`,
        token: accessToken,
      });
    })(),
  );
}
