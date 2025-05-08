import { apiRequest } from '@/lib/api/core/client';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';
import { tryCatch, type Result } from '@/lib/utils/try-catch';

/**
 * Uploads a new avatar for the authenticated user.
 * @param {File} file - The avatar image file to upload.
 * @returns {Promise<Result<string>>} A Result containing the avatar URL or an error.
 */
export async function updateAvatar(file: File): Promise<Result<string>> {
  return tryCatch(
    (async () => {
      const { accessToken } = await getAuthTokensAction();
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('file', file);

      return apiRequest<string>({
        method: 'POST',
        endpoint: 'profile/avatar',
        token: accessToken,
        body: formData,
      });
    })(),
  );
}
