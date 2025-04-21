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
    // Call the API function to refresh tokens
    const { user, tokens } = await refreshUserToken(refreshToken);

    // Set cookies with the new tokens
    const cookieStore = await cookies();

    // Set the access token cookie
    cookieStore.set(AUTH.AUTH_TOKEN, tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    // Set the refresh token cookie
    cookieStore.set(AUTH.REFRESH_TOKEN, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    // Return the user data
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
