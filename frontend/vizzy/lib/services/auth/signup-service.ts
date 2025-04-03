import { MultiStepSignupValues } from '@/app/auth/signup/schema/multi-step-signup-schema';
import { fetchGeocodingData } from '../location/location-service';
import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';

/**
 * Error response from the signup API
 */
export interface SignupErrorResponse {
  code: string;
  message: string;
  field?: string;
}

/**
 * Processes the complete signup form data and creates a new user account
 *
 * @param formData - The complete form data from all steps
 * @returns Promise that resolves when signup is complete
 * @throws Error with structured error information when signup fails
 */
export async function processSignup(
  formData: MultiStepSignupValues,
): Promise<void> {
  try {
    // Step 1: Get location coordinates from the geocoding API
    const { country, village } = formData;
    const address = `${village} ${country}`.trim();

    const locationData = await fetchGeocodingData(address);

    // Step 2: Send signup request with location data
    const { firstName, lastName, email, username, password } = formData;
    const name = `${firstName} ${lastName}`.trim();

    const signupResponse = await fetch(getApiUrl('auth/signup'), {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify({
        email,
        password,
        username,
        name,
        address: locationData.fullAddress,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      }),
      credentials: 'include',
    });

    if (!signupResponse.ok) {
      const errorData = await signupResponse.json();

      // Handle specific error codes based on status
      let errorPayload: SignupErrorResponse = {
        code: 'GENERIC_ERROR',
        message: errorData.message || 'An error occurred during sign-up',
      };

      switch (signupResponse.status) {
        case 409: // Email already exists
          errorPayload = {
            code: 'EMAIL_EXISTS',
            message: errorData.message || 'This email is already registered',
            field: 'email',
          };
          break;
        case 422: // Username already exists
          errorPayload = {
            code: 'USERNAME_EXISTS',
            message: errorData.message || 'This username is already taken',
            field: 'username',
          };
          break;
      }

      throw new Error(JSON.stringify(errorPayload));
    }

    // If we get here, signup was successful
    return;
  } catch (error) {
    // If it's already a structured error (from our code), rethrow it
    if (error instanceof Error && error.message.startsWith('{')) {
      throw error;
    }

    // Otherwise, wrap it in a structured error
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      JSON.stringify({
        code: 'NETWORK_ERROR',
        message: `Network error: ${errorMessage}`,
      }),
    );
  }
}

/**
 * Maps API error codes to form steps for navigation
 *
 * @param errorCode - The error code from the API
 * @returns The step index to navigate to
 */
export function getStepForErrorCode(errorCode: string): number {
  switch (errorCode) {
    case 'EMAIL_EXISTS':
      return 0; // Basic info step with email
    case 'USERNAME_EXISTS':
      return 1; // Account setup step with username
    case 'GEOCODING_ERROR':
      return 2; // Location step
    default:
      return 0; // Default to first step
  }
}
