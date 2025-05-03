import { Proposal } from '@/types/proposal';
import { apiRequest } from '@/lib/api/core/client';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import type { ProposalsWithCount } from '@/types/proposal';

export async function fetchProposalData(
  proposalId: number,
): Promise<Result<Proposal>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }
      return apiRequest<Proposal>({
        method: 'GET',
        endpoint: `proposals/${proposalId}`,
        token: accessToken,
      });
    })(),
  );
}
interface ProposalFilters {
  received?: boolean;
  sent?: boolean;
  accepted?: boolean;
  rejected?: boolean;
  cancelled?: boolean;
  pending?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchUserFilteredProposals(
  filters: ProposalFilters,
): Promise<Result<ProposalsWithCount>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams({
        page: String(filters.offset ?? 0),
        limit: String(filters.limit ?? 9),
        received: filters.received?.toString() || 'false',
        sent: filters.sent?.toString() || 'false',
        accepted: filters.accepted?.toString() || 'false',
        rejected: filters.rejected?.toString() || 'false',
        cancelled: filters.cancelled?.toString() || 'false',
        pending: filters.pending?.toString() || 'false',
      });

      return apiRequest<ProposalsWithCount>({
        method: 'GET',
        endpoint: `proposals?${queryParams.toString()}`,
        token: accessToken,
      });
    })(),
  );
}
