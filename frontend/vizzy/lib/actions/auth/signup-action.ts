'use server';

import { cookies } from 'next/headers';
import { signupUser } from '../../api/auth/authentication/signup';

/**
 * Server action to handle user signup and set authentication cookies
 * @param email - User's email address
 * @param password - User's password
 * @param username - User's username
 * @param name - User's full name
 * @returns The user data (without sensitive information)
 */
export async function signupUserAction(
  email: string,
  password: string,
  username: string,
  name: string,
) {
  try {
    // Call the API function to register user and get tokens
    const { user, tokens } = await signupUser(email, password, username, name);

    // Set cookies with the tokens
    const cookieStore = await cookies();

    // Set the access token cookie
    cookieStore.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
      sameSite: 'strict',
    });

    // Set the refresh token cookie
    cookieStore.set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'strict',
    });

    // Return the user data (without tokens)
    return { success: true, user };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}
