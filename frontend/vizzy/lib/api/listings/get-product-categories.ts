import { getApiUrl } from '../core/client';
export async function getProductCategories(): Promise<string[]> {
  const response = await fetch(getApiUrl('listings/categories'), {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to get product categories');
  }

  return await response.json();
}
