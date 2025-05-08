import { apiRequest } from '@/lib/api/core/client';
import { AuthResponse } from '@/types/user';

interface SignupRequest {
  email: string;
  password: string;
  username: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * This function sends a signup request to the /v1/auth/signup endpoint using a POST request.
 * It includes the user's email, password, username, name, and location information in the request body.
 * @param email - The user's email address
 * @param password - The user's password
 * @param username - The user's username
 * @param name - The user's name
 * @param address - The user's physical address (optional)
 * @param latitude - The user's location latitude (optional)
 * @param longitude - The user's location longitude (optional)
 * @returns {Promise<AuthResponse>} - A promise that resolves with user data and tokens
 * @throws {Error} - Throws an error if the signup failed.
 */
export async function signupUser(
  email: string,
  password: string,
  username: string,
  name: string,
  address?: string,
  latitude?: number,
  longitude?: number,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse, SignupRequest>({
    method: 'POST',
    endpoint: 'auth/signup',
    body: { 
      email, 
      password, 
      username, 
      name,
      ...(address && { address }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
    },
  });
}
