import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export interface FavoriteStatusResponse {
  isFavorited: boolean;
}

export async function checkFavoriteStatus(
  listingId: number,
): Promise<Result<FavoriteStatusResponse>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      return apiRequest<FavoriteStatusResponse>({
        method: 'GET',
        endpoint: `favorites/${listingId}/status`,
        token: accessToken,
      });
    })(),
  );
}
