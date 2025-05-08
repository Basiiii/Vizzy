import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import type { Listing } from '@/types/listing';

export async function fetchListing(id: string): Promise<Result<Listing>> {
  return tryCatch(
    (async () => {
      return apiRequest<Listing>({
        method: 'GET',
        endpoint: `listings/${id}`,
      });
    })(),
  );
}
