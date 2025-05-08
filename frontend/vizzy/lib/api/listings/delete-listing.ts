import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function deleteListing(listingId: number): Promise<Result<{ message: string }>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await apiRequest<{ message: string }>({
        method: 'DELETE',
        endpoint: `listings/${listingId}`,
        token: accessToken,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Verify the response
      if (!response || !response.message) {
        throw new Error('Invalid deletion response');
      }

      return response;
    })(),
  );
}