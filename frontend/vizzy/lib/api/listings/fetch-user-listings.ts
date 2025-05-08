import type { ListingBasic } from '@/types/listing';
import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function fetchListings(
  userId: string,
  page = 1,
  limit = 12,
): Promise<Result<ListingBasic[]>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      return apiRequest<ListingBasic[]>({
        method: 'GET',
        endpoint: `listings?userid=${userId}&page=${page}&limit=${limit}`,
        token: accessToken,
      });
    })(),
  );
}

export async function fetchAllListings(
  page = 1,
  limit = 12,
): Promise<Result<ListingBasic[]>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      return apiRequest<ListingBasic[]>({
        method: 'GET',
        endpoint: `listings?page=${page}&limit=${limit}`,
        token: accessToken,
      });
    })(),
  );
}

interface HomeListingsResponse {
  listings: ListingBasic[];
  totalPages: number;
  currentPage: number;
}

export async function fetchHomeListings(
  page = 1,
  limit = 12,
  type?: string,
  search?: string,
  locationParams?: {
    lat?: number;
    lon?: number;
    dist?: number;
  },
): Promise<Result<HomeListingsResponse>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (type && type !== 'all') {
        params.append('type', type);
      }
      if (search) {
        params.append('search', search);
      }

      if (locationParams) {
        if (locationParams.lat !== undefined) {
          params.append('lat', locationParams.lat.toString());
        }
        if (locationParams.lon !== undefined) {
          params.append('lon', locationParams.lon.toString());
        }
        if (locationParams.dist !== undefined) {
          params.append('dist', locationParams.dist.toString());
        }
      }

      return apiRequest<HomeListingsResponse>({
        method: 'GET',
        endpoint: `listings/home?${params.toString()}`,
        token: accessToken,
      });
    })(),
  );
}
