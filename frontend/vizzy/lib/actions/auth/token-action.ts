'use server';

import { AUTH } from '@/lib/constants/auth';
import { cookies } from 'next/headers';

/**
 * Server action to retrieve authentication tokens for client-side API calls
 * This should be used carefully as it exposes tokens to the client
 * @returns Object containing access and refresh tokens if they exist
 */
export async function getAuthTokensAction() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(AUTH.AUTH_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH.REFRESH_TOKEN)?.value;

  return {
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
  };
}

/**
 * Server action to check if the user is authenticated
 * @returns Boolean indicating if the user has a valid auth token
 */
export async function isAuthenticatedAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH.AUTH_TOKEN)?.value;

  return !!accessToken;
}
