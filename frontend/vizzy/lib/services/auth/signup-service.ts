import { MultiStepSignupValues } from '@/app/auth/signup/schema/multi-step-signup-schema';

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
  // Simulate API call with potential errors
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock validation - check for taken emails and usernames
      const takenEmails = [
        'test@example.com',
        'user@vizzy.com',
        'admin@vizzy.com',
      ];
      const takenUsernames = ['admin', 'test', 'vizzy', 'user'];

      if (takenEmails.includes(formData.email.toLowerCase())) {
        const error: SignupErrorResponse = {
          code: 'EMAIL_EXISTS',
          message: 'This email is already registered',
          field: 'email',
        };
        reject(new Error(JSON.stringify(error)));
        return;
      }

      if (takenUsernames.includes(formData.username.toLowerCase())) {
        const error: SignupErrorResponse = {
          code: 'USERNAME_EXISTS',
          message: 'This username is already taken',
          field: 'username',
        };
        reject(new Error(JSON.stringify(error)));
        return;
      }

      // If no errors, resolve the promise
      resolve();
    }, 1000);
  });
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
    default:
      return 0; // Default to first step
  }
}
