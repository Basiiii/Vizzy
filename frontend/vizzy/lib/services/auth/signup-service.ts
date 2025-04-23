import { MultiStepSignupValues } from '@/app/auth/signup/schema/multi-step-signup-schema';
// Remove unused API client imports
// import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { fetchGeocodingData } from '@/lib/api/location/geocoding';
// Import the server action
import { signupUserAction } from '@/lib/actions/auth/signup-action';

/**
 * Error response from the signup process (API or Action)
 */
export interface SignupErrorResponse {
  code: string;
  message: string;
  field?: string;
}

/**
 * Processes the complete signup form data using the signup server action
 *
 * @param formData - The complete form data from all steps
 * @returns Promise that resolves when signup is complete
 * @throws Error with structured error information when signup fails
 */
export async function processSignup(
  formData: MultiStepSignupValues,
): Promise<void> {
  try {
    // --- Geocoding remains the same ---
    const { country, village } = formData;
    const address = `${village} ${country}`.trim();

    const geoResult = await fetchGeocodingData(address);

    if (geoResult.error || !geoResult.data) {
      throw new Error(
        JSON.stringify({
          code: 'GEOCODING_ERROR',
          message:
            geoResult.error?.message || 'Failed to get location coordinates',
        }),
      );
    }

    // --- Prepare data for the action ---
    const { firstName, lastName, email, username, password } = formData;
    const name = `${firstName} ${lastName}`.trim();

    // --- Call the signupUserAction ---
    const result = await signupUserAction(
      email,
      password,
      username,
      name,
      geoResult.data.fullAddress,
      geoResult.data.latitude,
      geoResult.data.longitude,
    );

    // --- Handle the action response ---
    if (!result.success) {
      let errorPayload: SignupErrorResponse = {
        code: 'SIGNUP_ACTION_FAILED',
        message: 'An unknown error occurred during sign-up.',
      };

      if (result.error) {
        let parsedApiError: any = null;
        try {
          // Attempt to extract the JSON part of the error string
          const jsonStringMatch = result.error.match(/{.*}/);
          if (jsonStringMatch && jsonStringMatch[0]) {
            parsedApiError = JSON.parse(jsonStringMatch[0]);
          }

          if (parsedApiError) {
            // Use parsed data if successful
            // Prioritize specific codes if the action provides them directly
            if (parsedApiError.code === 'EMAIL_EXISTS') {
              errorPayload = {
                code: 'EMAIL_EXISTS',
                message:
                  parsedApiError.message || 'This email is already registered',
                field: 'email',
              };
            } else if (parsedApiError.code === 'USERNAME_EXISTS') {
              errorPayload = {
                code: 'USERNAME_EXISTS',
                message:
                  parsedApiError.message || 'This username is already taken',
                field: 'username',
              };
              // Check for status codes if code is not specific
            } else if (
              parsedApiError.statusCode === 409 ||
              parsedApiError.status === 409
            ) {
              // Check both statusCode and status
              errorPayload = {
                code: 'EMAIL_EXISTS',
                message:
                  parsedApiError.message ||
                  'This email is already registered (Status 409)',
                field: 'email',
              };
            } else if (
              parsedApiError.statusCode === 422 ||
              parsedApiError.status === 422
            ) {
              // Check both statusCode and status
              errorPayload = {
                code: 'USERNAME_EXISTS',
                message:
                  parsedApiError.message ||
                  'This username is already taken (Status 422)',
                field: 'username',
              };
              // Fallback if parsing worked but no specific code/status matched
            } else {
              errorPayload = {
                code: parsedApiError.code || 'UNKNOWN_API_ERROR',
                message: parsedApiError.message || result.error, // Use original error if message missing
                field: parsedApiError.field,
              };
            }
          } else {
            // If JSON extraction/parsing failed, fall back to string matching
            throw new Error('Parsing failed, fallback to string matching'); // Jump to catch block
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (parseOrMatchError) {
          // Fallback to string matching on the original error string
          errorPayload.message = result.error; // Keep original error message
          if (
            result.error.includes('Email already registered') ||
            result.error.includes('Email already exists') ||
            result.error.includes('Status 409') // Added status check just in case
          ) {
            errorPayload.code = 'EMAIL_EXISTS';
            errorPayload.field = 'email';
          } else if (
            result.error.includes('Username already registered') ||
            result.error.includes('Username already exists') ||
            result.error.includes('Status 422') // Added status check just in case
          ) {
            errorPayload.code = 'USERNAME_EXISTS';
            errorPayload.field = 'username';
          } else {
            // Keep 'SIGNUP_ACTION_FAILED' code if no specific string match
            // Ensure message is set from the original error
            errorPayload.message =
              result.error || 'Signup action failed with unknown error.';
          }
        }
      }
      // Throw the structured error for the form handler
      throw new Error(JSON.stringify(errorPayload));
    }

    // If we get here, signup via action was successful
    return;
  } catch (error) {
    // If it's already a structured error (from our code or the action handling), rethrow it
    if (error instanceof Error && error.message.startsWith('{')) {
      throw error;
    }

    // Otherwise, wrap it in a generic structured error
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown processing error';
    throw new Error(
      JSON.stringify({
        code: 'PROCESSING_ERROR', // Changed from NETWORK_ERROR as it's broader now
        message: `Error processing signup: ${errorMessage}`,
      }),
    );
  }
}

/**
 * Maps error codes (from API via Action or Geocoding) to form steps for navigation
 *
 * @param errorCode - The error code
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
    // Add cases for new error codes if needed
    case 'SIGNUP_ACTION_FAILED':
    case 'UNKNOWN_API_ERROR':
    case 'PROCESSING_ERROR':
    default:
      return 0; // Default to first step for generic/unknown errors
  }
}
