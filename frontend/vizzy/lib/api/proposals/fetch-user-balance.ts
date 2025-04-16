import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { createAuthHeaders } from '@/lib/api/core/client';

export async function fetchUserBalance(): Promise<number> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = createAuthHeaders(token);

  const response = await fetch(`${API_URL}/${API_VERSION}/proposals/balance`, {
    method: 'GET',
    headers: headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user balance');
  }
  const data = await response.json();
  return data;
}
