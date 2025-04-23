import { apiRequest } from '@/lib/api/core/client';
import { AuthResponse } from '@/types/user';

interface SignupRequest {
  email: string;
  password: string;
  username: string;
  name: string;
}

/**
 * This function sends a signup request to the /api/auth/signup endpoint using a POST request.
 * It includes the user's email, password, username, and name in the request body.
 * @param email - The user's email address
 * @param password - The user's password
 * @param username - The user's username
 * @param name - The user's name
 * @returns {Promise<AuthResponse>} - A promise that resolves with user data and tokens
 * @throws {Error} - Throws an error if the signup failed.
 */
export async function signupUser(
  email: string,
  password: string,
  username: string,
  name: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse, SignupRequest>({
    method: 'POST',
    endpoint: 'auth/signup',
    body: { email, password, username, name },
  });
}
