import { getApiUrl } from '@/lib/api/core/client';

/**
 * Initiates the password reset process by sending a reset link to the user's email.
 *
 * @param {string} email - The email address of the user.
 * @throws {Error} - Throws an error if the request fails, either due to a network issue or a server error.
 */
export async function sendResetEmail(email: string): Promise<void> {
  try {
    const response = await fetch(getApiUrl('password-reset/initiate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initiate password reset');
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Password reset initiation error:', error);

    // Rethrow the error with a user-friendly message
    throw new Error(
      error instanceof Error ? error.message : 'Failed to send reset email',
    );
  }
}
