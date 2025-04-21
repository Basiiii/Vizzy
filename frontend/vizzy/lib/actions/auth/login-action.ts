'use server';

import { cookies } from 'next/headers';
import { LogInUser } from '../../api/auth/authentication/login';
import { AUTH } from '@/lib/constants/auth';

/**
 * Server action to handle user login and set authentication cookies
 * @param email - User's email address
 * @param password - User's password
 * @returns The user data (without sensitive information)
 */
export async function loginUserAction(email: string, password: string) {
  try {
    console.log('[LoginAction] Starting login process');

    // Call the API function to get tokens
    const { user, tokens } = await LogInUser(email, password);
    console.log('[LoginAction] Received tokens from API');

    // Set cookies with the tokens
    const cookieStore = await cookies();
    console.log('[LoginAction] Cookie store initialized');

    // Set the access token cookie
    console.log('[LoginAction] Setting access token cookie');
    cookieStore.set(AUTH.AUTH_TOKEN, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[LoginAction] Access token cookie set');

    // Set the refresh token cookie
    console.log('[LoginAction] Setting refresh token cookie');
    cookieStore.set(AUTH.REFRESH_TOKEN, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[LoginAction] Refresh token cookie set');

    // Verify cookies were set
    const accessTokenCookie = cookieStore.get(AUTH.AUTH_TOKEN);
    const refreshTokenCookie = cookieStore.get(AUTH.REFRESH_TOKEN);
    console.log('[LoginAction] Cookie verification:');
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
    console.error('[LoginAction] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
