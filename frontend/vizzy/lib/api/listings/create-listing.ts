import { getClientCookie } from '@/lib/utils/cookies/get-client-cookie';
import { createAuthHeaders } from '@/lib/api/core/client';
import { CreateListingDto } from '@/types/create-listing';
export async function createListing(
  createListing: CreateListingDto,
): Promise<number> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
  const token = getClientCookie('auth-token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  console.log(createListing);
  const headers = createAuthHeaders(token);

  const response = await fetch(`${API_URL}/${API_VERSION}/listings`, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
    body: JSON.stringify(createListing),
  });

  if (!response.ok) {
    throw new Error('Failed to create listing');
  }

  return await response.json();
}
