import { Proposal } from '@/types/proposal';
import { createAuthHeaders } from './core/client';
import { getClientUser } from '../utils/token/get-client-user';
import { getClientCookie } from '../utils/cookies/get-client-cookie';
export async function fetchAllProposals(
  page = 1,
  limit = 12,
): Promise<Proposal[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
    const token = getClientCookie('auth-token');
    if (token) {
      const response = await fetch(
        `${API_URL}/${API_VERSION}/proposals?page=${page}&limit=${limit}`,
        {
          method: 'Get',
          headers: createAuthHeaders(token),
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }

      console.log(response);

      return await response.json();
    } else throw new Error('Failed to fetch proposals');
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw new Error('Failed to fetch proposals');
  }
}
