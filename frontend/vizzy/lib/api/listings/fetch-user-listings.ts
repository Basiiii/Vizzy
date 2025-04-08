import type { ListingBasic } from '@/types/listing';

export async function fetchListings(userId: string): Promise<ListingBasic[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    const response = await fetch(
      `${API_URL}/${API_VERSION}/listings?userid=${userId}&page=1&limit=8`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user listings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching listings info:', error);
    throw new Error('Failed to fetch listing information');
  }
}

export async function fetchAllListings(
  page = 1,
  limit = 12,
): Promise<ListingBasic[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    const response = await fetch(
      `${API_URL}/${API_VERSION}/listings?page=${page}&limit=${limit}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw new Error('Failed to fetch listings');
  }
}
