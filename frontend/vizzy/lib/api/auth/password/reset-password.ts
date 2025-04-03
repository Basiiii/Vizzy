import { getApiUrl } from '@/lib/api/core/client';

/**
 * Updates the user's password using a reset token.
 * @param {string} newPassword - The new password for the user.
 * @param {string} token - The reset token received from the email link.
 * @returns {Promise<void>} - Throws an error if the update fails.
 */
export async function resetPassword(
  newPassword: string,
  token: string,
): Promise<void> {
  try {
    const response = await fetch(getApiUrl('password-reset/reset'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update password');
    }
  } catch (error) {
    console.error('Password update error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to update password',
    );
  }
}
