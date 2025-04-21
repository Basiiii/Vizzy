import { apiRequest } from '@/lib/api/core/client';
import { User } from '@/types/user';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';

/**
 * This function verifies the current authentication token by sending a request to the /api/auth/verify endpoint.
 * It uses the auth-token from cookies. If the response is successful, it returns the user data.
 * @returns {Promise<User>} - A promise that resolves with the user data if the token is valid
 * @throws {Error} - Throws an error if the token verification failed.
 */
export async function verifyAuthToken(): Promise<User> {
  const token = getClientCookie('auth-token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiRequest<User>({
    method: 'POST',
    endpoint: 'auth/verify',
    token,
  });
}
