import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { createAuthHeaders } from '@/lib/api/core/client';

export async function updateProposalStatus(status: string, proposalId: number) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  console.log('Status:', status);
  const headers = createAuthHeaders(token);

  const response = await fetch(
    `${API_URL}/${API_VERSION}/proposals/${proposalId}/status`,
    {
      method: 'PATCH',
      headers: headers,
      credentials: 'include',
      body: JSON.stringify({ status: status }),
    },
  );

  if (!response.ok) {
    throw new Error('Update proposal status failed');
  }
}
