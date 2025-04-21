'use server';

import { cookies } from 'next/headers';
import { LogInUser } from '../../api/auth/authentication/login';

/**
 * Server action to handle user login and set authentication cookies
 * @param email - User's email address
 * @param password - User's password
 * @returns The user data (without sensitive information)
 */
export async function loginUserAction(email: string, password: string) {
  try {
    // Call the API function to get tokens
    const { user, tokens } = await LogInUser(email, password);

    // Set cookies with the tokens
    const cookieStore = cookies();

    // Set the access token cookie
    (
      await // Set the access token cookie
      cookieStore
    ).set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'strict',
    });

    // Set the refresh token cookie
    (
      await // Set the refresh token cookie
      cookieStore
    ).set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'strict',
    });

    // Return the user data (without tokens)
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
