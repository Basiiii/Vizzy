import { createAuthHeaders } from '@/lib/api/core/client';
import { CreateProposalDto } from '@/types/create-proposal';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { ProposalResponseDto } from '@/types/proposal-response';

export async function createProposal(
  createProposal: CreateProposalDto,
): Promise<{ ProposalResponseDto: ProposalResponseDto }> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = createAuthHeaders(token);

  const response = await fetch(`${API_URL}/${API_VERSION}/proposals`, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
    body: JSON.stringify(createProposal),
  });

  if (!response.ok) {
    throw new Error('Failed to create proposal');
  }

  return await response.json();
}
