'use server';

import { AUTH } from '@/lib/constants/auth';
import { ROUTES } from '@/lib/constants/routes/routes';
import { getServerCookie } from '@/lib/utils/cookies/get-server-cookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function deleteAccount() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    // Get token from server-side cookies
    const token = getServerCookie(AUTH.AUTH_TOKEN);
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_URL}/${API_VERSION}/users`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user account');
    }

    // Delete auth cookies after successful account deletion
    (await cookies()).delete(AUTH.AUTH_TOKEN);
    (await cookies()).delete(AUTH.REFRESH_TOKEN);

    // Redirect to home page
    redirect(ROUTES.HOME);
  } catch (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account');
  }
}
