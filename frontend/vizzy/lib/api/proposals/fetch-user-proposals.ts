import { Proposal } from '@/types/proposal';
import { createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
const token = getClientCookie('auth-token');

/* export async function fetchAllProposals(
  page = 1,
  limit = 12,
): Promise<Proposal[]> {
  try {
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
} */
export async function fetchSentProposals(): Promise<Proposal[]> {
  try {
    console.log('Token available:', !!token);
    console.log(
      'API URL:',
      `${API_URL}/${API_VERSION}/proposals/basic-sent-proposals`,
    );

    if (token) {
      const headers = createAuthHeaders(token);
      console.log('Request headers:', headers);

      const response = await fetch(
        `${API_URL}/${API_VERSION}/proposals/basic-sent-proposals?page=1&limit=10`,
        {
          method: 'GET',
          headers: headers,
          credentials: 'include',
        },
      );

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(
          `Failed to fetch sent proposals: ${response.statusText}`,
        );
      }

      return responseData;
    } else throw new Error('No authentication token found');
  } catch (error) {
    console.error('Detailed error in fetchSentProposals:', error);
    throw error;
  }
}

export async function fetchReceivedProposals(): Promise<Proposal[]> {
  try {
    console.log('Token available:', !!token);
    console.log(
      'API URL:',
      `${API_URL}/${API_VERSION}/proposals/basic-received-proposals`,
    );

    if (!token) {
      throw new Error('Authentication required');
    }

    const headers = createAuthHeaders(token);
    console.log('Request headers:', headers);

    const response = await fetch(
      `${API_URL}/${API_VERSION}/proposals/basic-received-proposals?page=1&limit=10`,
      {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      },
    );

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(
        `Failed to fetch received proposals: ${response.statusText}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error('Detailed error in fetchReceivedProposals:', error);
    throw error;
  }
}
export async function fetchProposalData(proposalId: number): Promise<Proposal> {
  try {
    console.log('Token available:', !!token);
    console.log(
      'API URL:',
      `${API_URL}/${API_VERSION}/proposals/proposal-data?proposalId=${proposalId}`,
    );

    if (!token) {
      throw new Error('Authentication required');
    }

    const headers = createAuthHeaders(token);
    console.log('Request headers:', headers);

    const response = await fetch(
      `${API_URL}/${API_VERSION}/proposals/proposal-data?proposalId=${proposalId}`,
      {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      },
    );

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch proposal details: ${response.statusText}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error('Detailed error in fetchProposalData:', error);
    throw error;
  }
}
