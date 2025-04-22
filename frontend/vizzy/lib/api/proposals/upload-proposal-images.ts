import { apiRequest } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

export async function uploadProposalImages(
  proposalId: number,
  images: File[],
): Promise<Result<void>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      return apiRequest<void>({
        method: 'POST',
        endpoint: `proposals/${proposalId}/images`,
        token: accessToken,
        body: formData,
      });
    })(),
  );
}
