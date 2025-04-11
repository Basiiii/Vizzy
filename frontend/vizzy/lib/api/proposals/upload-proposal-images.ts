import { createAuthHeaders } from '@/lib/api/core/client';
import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';

/**
 * Uploads images for a specific proposal
 * @param proposalId - The ID of the proposal to upload images for
 * @param images - Array of image files to upload
 * @returns Promise that resolves when upload is complete
 */
export async function uploadProposalImages(
  proposalId: number,
  images: File[],
): Promise<void> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = createAuthHeaders(token);
  const formData = new FormData();

  // Append each image to the form data
  images.forEach((image, index) => {
    formData.append(`image${index}`, image);
  });

  const response = await fetch(
    `${API_URL}/${API_VERSION}/proposals/${proposalId}/images`,
    {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to upload proposal images: ${response.statusText}`);
  }
}
