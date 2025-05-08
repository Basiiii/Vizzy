import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { Balance } from '@/types/balance';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function fetchUserBalance(): Promise<Result<Balance>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await apiRequest<{ balance: number }>({
        method: 'GET',
        endpoint: 'proposals/balance',
        token: accessToken,
      });

      return { balance: response.balance };
    })(),
  );
}
