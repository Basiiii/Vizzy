'use server';

import { cookies } from 'next/headers';

/**
 * Server action to log out a user by clearing authentication cookies
 */
export async function logoutUserAction() {
  const cookieStore = await cookies();

  // Clear the auth token cookie
  cookieStore.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expire immediately
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  // Clear the refresh token cookie
  cookieStore.set('refresh-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0, // Expire immediately
    path: '/',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return { success: true };
}
