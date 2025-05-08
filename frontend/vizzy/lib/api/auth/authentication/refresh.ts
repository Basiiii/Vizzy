import { apiRequest } from '@/lib/api/core/client';
import { AuthResponse } from '@/types/user';

/**
 * This function sends a refresh token request to the /api/auth/refresh endpoint using a POST request.
 * It includes the refresh token in the request body. If the response is successful, it returns the new tokens.
 * @param refreshToken - The refresh token
 * @returns {Promise<AuthResponse>} - A promise that resolves with user data and new tokens
 * @throws {Error} - Throws an error if the token refresh failed.
 */
export async function refreshUserToken(
  refreshToken: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse, { refreshToken: string }>({
    method: 'POST',
    endpoint: 'auth/refresh',
    body: { refreshToken },
  });
}
