import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { AUTH } from '@/lib/constants/auth';
import { tryCatch, type Result } from '@/lib/utils/try-catch';

/**
 * Uploads a new avatar for the authenticated user.
 * @param {File} file - The avatar image file to upload.
 * @returns {Promise<Result<string>>} A Result containing the avatar URL or an error.
 */
export async function updateAvatar(file: File): Promise<Result<string>> {
  return tryCatch(
    (async () => {
      const formData = new FormData();
      formData.append('file', file);

      const token = getClientCookie(AUTH.AUTH_TOKEN);
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(getApiUrl('profile/avatar'), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      return data.avatarUrl as string;
    })(),
  );
}
