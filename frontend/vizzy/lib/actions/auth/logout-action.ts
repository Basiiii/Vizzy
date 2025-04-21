'use server';

import { cookies } from 'next/headers';
import { AUTH } from '@/lib/constants/auth';

/**
 * Server action to log out a user by clearing authentication cookies
 */
export async function logoutUserAction() {
  try {
    console.log('[LogoutAction] Starting logout process');
    
    const cookieStore = await cookies();
    console.log('[LogoutAction] Cookie store initialized');

    console.log('[LogoutAction] Clearing access token cookie');
    cookieStore.set(AUTH.AUTH_TOKEN, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[LogoutAction] Access token cookie cleared');

    console.log('[LogoutAction] Clearing refresh token cookie');
    cookieStore.set(AUTH.REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[LogoutAction] Refresh token cookie cleared');

    // Verify cookies
    const accessTokenCookie = cookieStore.get(AUTH.AUTH_TOKEN);
    const refreshTokenCookie = cookieStore.get(AUTH.REFRESH_TOKEN);
    console.log('[LogoutAction] Cookie verification:');
    console.log('- Access Token Cookie:', accessTokenCookie ? 'Still Set' : 'Cleared');
    console.log('- Refresh Token Cookie:', refreshTokenCookie ? 'Still Set' : 'Cleared');

    return { success: true };
  } catch (error) {
    console.error('[LogoutAction] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
