'use server';

import { AUTH } from '@/lib/constants/auth';
import { ROUTES } from '@/lib/constants/routes/routes';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Logs out the current user by removing authentication cookies and redirecting to the login page.
 *
 * @async
 * @function logout
 * @throws {Error} If the logout process fails (e.g., unable to delete cookies)
 * @returns {void} Redirects to the login page on successful logout
 *
 * @example
 * ```typescript
 * await logout();
 * // User will be redirected to login page
 * ```
 */
export async function logout() {
  try {
    // Delete auth cookies
    (await cookies()).delete(AUTH.AUTH_TOKEN);
    (await cookies()).delete(AUTH.REFRESH_TOKEN);
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error('Logout failed');
  }

  // Redirect to login page
  redirect(ROUTES.LOGIN);
}
