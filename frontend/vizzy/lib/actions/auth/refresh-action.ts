'use server';

import { cookies } from 'next/headers';
import { refreshUserToken } from '@/lib/api/auth/authentication/refresh';
import { AUTH } from '@/lib/constants/auth';

/**
 * Server action to refresh the authentication token
 * @param refreshToken - The refresh token to use
 * @returns Object indicating success or failure and user data
 */
export async function refreshTokenAction(refreshToken: string) {
  try {
    console.log('[RefreshAction] Starting token refresh');

    const { user, tokens } = await refreshUserToken(refreshToken);
    console.log('[RefreshAction] Received new tokens');

    const cookieStore = await cookies();
    console.log('[RefreshAction] Cookie store initialized');

    console.log('[RefreshAction] Setting access token cookie');
    cookieStore.set(AUTH.AUTH_TOKEN, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[RefreshAction] Access token cookie set');

    console.log('[RefreshAction] Setting refresh token cookie');
    cookieStore.set(AUTH.REFRESH_TOKEN, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[RefreshAction] Refresh token cookie set');

    // Verify cookies
    const accessTokenCookie = cookieStore.get(AUTH.AUTH_TOKEN);
    const refreshTokenCookie = cookieStore.get(AUTH.REFRESH_TOKEN);
    console.log('[RefreshAction] Cookie verification:');
    console.log(
      '- Access Token Cookie:',
      accessTokenCookie ? 'Set' : 'Not Set',
    );
    console.log(
      '- Refresh Token Cookie:',
      refreshTokenCookie ? 'Set' : 'Not Set',
    );

    return { success: true, user };
  } catch (error) {
    console.error('[RefreshAction] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
