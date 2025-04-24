'use server';

import { deleteUserAccount } from '@/lib/api/auth/authentication/delete-account';
import { logoutUserAction } from './logout-action';

/**
 * Server action to delete a user account and log them out
 * @returns Object indicating success or failure
 */
export async function deleteAccountAction() {
  try {
    // Call the API to delete the account
    await deleteUserAccount();

    // Log the user out (clear cookies)
    await logoutUserAction();

    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete account',
    };
  }
}
