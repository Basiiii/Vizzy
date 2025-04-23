import { MultiStepSignupValues } from '@/app/auth/signup/schema/multi-step-signup-schema';
import { fetchGeocodingData } from '@/lib/api/location/geocoding';
import { signupUserAction } from '@/lib/actions/auth/signup-action';

/**
 * Error response from the signup process (API or Action)
 */
export interface SignupErrorResponse {
  code: string;
  message: string;
  field?: string;
}

interface ParsedApiError {
  code?: string;
  message?: string;
  statusCode?: number;
  status?: number;
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

    const { firstName, lastName, email, username, password } = formData;
    const name = `${firstName} ${lastName}`.trim();

    const result = await signupUserAction(
      email,
      password,
      username,
      name,
      geoResult.data.fullAddress,
      geoResult.data.latitude,
      geoResult.data.longitude,
    );

    if (!result.success) {
      let errorPayload: SignupErrorResponse = {
        code: 'SIGNUP_ACTION_FAILED',
        message: 'An unknown error occurred during sign-up.',
      };

      if (result.error) {
        let parsedApiError: ParsedApiError | null = null;
        try {
          const jsonStringMatch = result.error.match(/{.*}/);
          if (jsonStringMatch && jsonStringMatch[0]) {
            parsedApiError = JSON.parse(jsonStringMatch[0]);
          }

          if (parsedApiError) {
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
            } else if (
              parsedApiError.statusCode === 409 ||
              parsedApiError.status === 409
            ) {
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
              errorPayload = {
                code: 'USERNAME_EXISTS',
                message:
                  parsedApiError.message ||
                  'This username is already taken (Status 422)',
                field: 'username',
              };
            } else {
              errorPayload = {
                code: parsedApiError.code || 'UNKNOWN_API_ERROR',
                message: parsedApiError.message || result.error,
                field: parsedApiError.field,
              };
            }
          } else {
            throw new Error('Parsing failed, fallback to string matching');
          }
        } catch {
          errorPayload.message = result.error;
          if (
            result.error.includes('Email already registered') ||
            result.error.includes('Email already exists') ||
            result.error.includes('Status 409')
          ) {
            errorPayload.code = 'EMAIL_EXISTS';
            errorPayload.field = 'email';
          } else if (
            result.error.includes('Username already registered') ||
            result.error.includes('Username already exists') ||
            result.error.includes('Status 422')
          ) {
            errorPayload.code = 'USERNAME_EXISTS';
            errorPayload.field = 'username';
          } else {
            errorPayload.message =
              result.error || 'Signup action failed with unknown error.';
          }
        }
      }
      throw new Error(JSON.stringify(errorPayload));
    }

    return;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('{')) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown processing error';
    throw new Error(
      JSON.stringify({
        code: 'PROCESSING_ERROR',
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
      return 0;
    case 'USERNAME_EXISTS':
      return 1;
    case 'GEOCODING_ERROR':
      return 2;
    case 'SIGNUP_ACTION_FAILED':
    case 'UNKNOWN_API_ERROR':
    case 'PROCESSING_ERROR':
    default:
      return 0;
  }
}
