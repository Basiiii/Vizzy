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

    return user;
  } catch (error) {
    console.error('[LoginAction] Error:', error);
    
    // Create a serializable error object to send to the client
    let clientError: Error;
    let errorType = 'LoginError';
    
    if (error instanceof Error) {
      // Extract useful information from the error
      let message = error.message;
      let field: string | undefined;
      
      // Try to parse JSON error messages
      try {
        const parsedError = JSON.parse(message);
        if (parsedError && typeof parsedError === 'object') {
          // Handle structured errors with type information
          if (parsedError.type) {
            errorType = parsedError.type; // Use the error type from the structured error
            
            if (parsedError.type === 'ValidationError') {
              // Handle validation errors specifically
              message = parsedError.message || 'Validation failed';
              field = parsedError.field;
              
              // Create more user-friendly messages for specific fields
              if (field === 'password') {
                message = 'Invalid email or password';
              } else if (field === 'email') {
                message = 'Invalid email or password';
              }
            } else {
              // Handle other structured errors
              message = parsedError.message || message;
            }
          } else if (parsedError.message) {
            // Simple object with message
            message = typeof parsedError.message === 'string' 
              ? parsedError.message 
              : 'Authentication failed';
          } else if (parsedError.error) {
            message = parsedError.error;
          }
        }
      } catch {
        // Not a JSON string, use as is
      }
      
      // Create a new error with the extracted message
      clientError = new Error(message);
    } else {
      clientError = new Error('An unknown error occurred during login');
    }
    
    // Add a name to help identify this error type
    clientError.name = errorType;
    
    throw clientError;
  }
}
