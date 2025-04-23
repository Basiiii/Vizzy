import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { ProposalImageDto } from '@/types/proposal-images';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function fetchProposalImages(
  proposalId: number,
): Promise<Result<ProposalImageDto[]>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const response = await apiRequest<{ images: ProposalImageDto[] }>({
        method: 'GET',
        endpoint: `proposals/${proposalId}/images`,
        token: accessToken,
      });

      return response.images;
    })(),
  );
}
