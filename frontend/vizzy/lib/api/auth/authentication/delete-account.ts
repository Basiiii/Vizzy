import { apiRequest } from '@/lib/api/core/client';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

/**
 * Sends a request to delete the user's account
 * Uses the auth token from server action
 * @returns A promise that resolves when the account is successfully deleted
 * @throws Error if the deletion fails or if no token is found
 */
export async function deleteUserAccount(): Promise<void> {
  // Get token using the server action
  const { accessToken } = await getAuthTokensAction();

  if (!accessToken) {
    throw new Error('Authentication token not found');
  }

  return apiRequest<void>({
    method: 'DELETE',
    endpoint: 'users',
    token: accessToken,
  });
}
