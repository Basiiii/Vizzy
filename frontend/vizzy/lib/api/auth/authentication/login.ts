import { apiRequest } from '@/lib/api/core/client';
import { AuthResponse } from '@/types/user';

/**
 * This function sends a login request to the /api/auth/login endpoint using a POST request.
 * It includes the user's email and password in the request body.
 * @param email - The user's email address
 * @param password - The user's password
 * @returns {Promise<AuthResponse>} - A promise that resolves with user data and tokens
 * @throws {Error} - Throws an error if the login failed.
 */
export async function LogInUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse, { email: string; password: string }>({
    method: 'POST',
    endpoint: 'auth/login',
    body: { email, password },
  });
}
