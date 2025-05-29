import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import type { ListingBasic } from '@/types/listing';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

interface GetFavoritesParams {
  limit?: number;
  offset?: number;
}

export async function getFavorites(
  params?: GetFavoritesParams,
): Promise<Result<ListingBasic[]>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset)
        queryParams.append('offset', params.offset.toString());

      return apiRequest<ListingBasic[]>({
        method: 'GET',
        endpoint: `favorites?${queryParams.toString()}`,
        token: accessToken,
      });
    })(),
  );
}
