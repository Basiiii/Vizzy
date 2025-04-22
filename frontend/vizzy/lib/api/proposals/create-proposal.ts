import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { CreateProposalDto } from '@/types/create-proposal';
import { ProposalResponseDto } from '@/types/proposal-response';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function createProposal(
  createProposal: CreateProposalDto,
): Promise<Result<ProposalResponseDto>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      return apiRequest<ProposalResponseDto>({
        method: 'POST',
        endpoint: 'proposals',
        token: accessToken,
        body: createProposal,
      });
    })(),
  );
}
