import { Proposal } from '@/types/proposal';
import { createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import type { ProposalsWithCount } from '@/types/proposal';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
const token = getClientCookie('auth-token');

export async function fetchProposalData(proposalId: number): Promise<Proposal> {
  console.log('Fetching proposal details for ID:', proposalId);
  try {
    console.log('Token available:', !!token);
    console.log(
      'API URL:',
      `${API_URL}/${API_VERSION}/proposals/${proposalId}`,
    );

    if (!token) {
      throw new Error('Authentication required');
    }

    const headers = createAuthHeaders(token);
    console.log('Request headers:', headers);

    const response = await fetch(
      `${API_URL}/${API_VERSION}/proposals/${proposalId}`,
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

interface ProposalFilters {
  received?: boolean;
  sent?: boolean;
  accepted?: boolean;
  rejected?: boolean;
  canceled?: boolean;
  pending?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchUserFilteredProposals(
  filters: ProposalFilters,
): Promise<ProposalsWithCount> {
  try {
    if (token) {
      const headers = createAuthHeaders(token);

      const queryParams = new URLSearchParams({
        page: String(filters.offset!),
        limit: String(filters.limit),
        received: filters.received?.toString() || 'false',
        sent: filters.sent?.toString() || 'false',
        accepted: filters.accepted?.toString() || 'false',
        rejected: filters.rejected?.toString() || 'false',
        canceled: filters.canceled?.toString() || 'false',
        pending: filters.pending?.toString() || 'false',
      });

      const response = await fetch(
        `${API_URL}/${API_VERSION}/proposals?${queryParams.toString()}`,
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
          return { totalProposals: 0, proposals: [] };
        }
        throw new Error(`Failed to fetch proposals: ${response.statusText}`);
      }

      return responseData;
    } else throw new Error('No authentication token found');
  } catch (error) {
    console.error('Detailed error in fetchProposalsByStatus:', error);
    throw error;
  }
}
