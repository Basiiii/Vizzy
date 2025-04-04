import { Proposal } from '@/types/proposal';
//import { createAuthHeaders } from './core/client';
export async function fetchAllProposals(
  page = 1,
  limit = 12,
): Promise<Proposal[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
    const response = await fetch(
      `${API_URL}/${API_VERSION}/proposals?page=${page}&limit=${limit}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch proposals');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw new Error('Failed to fetch proposals');
  }
}
