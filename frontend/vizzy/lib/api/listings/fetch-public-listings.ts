import type { ListingBasic } from '@/types/listing';
import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';

interface PublicListingsResponse {
  listings: ListingBasic[];
  totalPages: number;
  currentPage: number;
}

export async function fetchPublicListings(
  page = 1,
  limit = 12,
  type?: string,
  search?: string,
  locationParams?: {
    lat?: number;
    lon?: number;
    dist?: number;
  },
): Promise<Result<PublicListingsResponse>> {
  return tryCatch(
    (async () => {
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

      return apiRequest<PublicListingsResponse>({
        method: 'GET',
        endpoint: `listings/home?${params.toString()}`,
      });
    })(),
  );
}
