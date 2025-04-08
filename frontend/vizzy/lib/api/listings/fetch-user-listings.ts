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

export async function fetchHomeListings(
  page = 1,
  limit = 12,
  type?: string,
  search?: string,
  locationParams?: {
    lat?: number;
    lon?: number;
    dist?: number;
  }
): Promise<{ listings: ListingBasic[], totalPages: number, currentPage: number }> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (type && type !== 'all') {
      params.append('type', type);
    }
    
    if (search) {
      params.append('search', search);
    }

    // Add location parameters if provided
    if (locationParams) {
      if (locationParams.lat !== undefined) {
        params.append('lat', locationParams.lat.toString());
      }
      if (locationParams.lon !== undefined) {
        params.append('lon', locationParams.lon.toString());
      }
      if (locationParams.dist !== undefined) {
        params.append('dist', locationParams.dist.toString());
      }
    }

    const response = await fetch(
      `${API_URL}/${API_VERSION}/listings/home?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch home listings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching home listings:', error);
    throw new Error('Failed to fetch home listings');
  }
}
