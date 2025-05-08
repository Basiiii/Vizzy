'use server';

import { cookies } from 'next/headers';
import { signupUser } from '../../api/auth/authentication/signup';
import { AUTH } from '@/lib/constants/auth';

/**
 * Server action to handle user signup and set authentication cookies
 * @param email - User's email address
 * @param password - User's password
 * @param username - User's username
 * @param name - User's full name
 * @param address - User's physical address
 * @param latitude - User's location latitude
 * @param longitude - User's location longitude
 * @returns The user data (without sensitive information)
 */
export async function signupUserAction(
  email: string,
  password: string,
  username: string,
  name: string,
  address?: string,
  latitude?: number,
  longitude?: number,
) {
  try {
    console.log('[SignupAction] Starting signup process');

    const { user, tokens } = await signupUser(
      email,
      password,
      username,
      name,
      address,
      latitude,
      longitude,
    );
    console.log('[SignupAction] Received tokens from API');

    const cookieStore = await cookies();
    console.log('[SignupAction] Cookie store initialized');

    console.log('[SignupAction] Setting access token cookie');
    cookieStore.set(AUTH.AUTH_TOKEN, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[SignupAction] Access token cookie set');

    console.log('[SignupAction] Setting refresh token cookie');
    cookieStore.set(AUTH.REFRESH_TOKEN, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    });
    console.log('[SignupAction] Refresh token cookie set');

    // Verify cookies
    const accessTokenCookie = cookieStore.get(AUTH.AUTH_TOKEN);
    const refreshTokenCookie = cookieStore.get(AUTH.REFRESH_TOKEN);
    console.log('[SignupAction] Cookie verification:');
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
    console.error('[SignupAction] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
