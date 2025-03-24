// actions/auth/logout.ts
'use server';

import { AUTH } from '@/lib/constants/auth';
import { ROUTES } from '@/lib/constants/routes/routes';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
