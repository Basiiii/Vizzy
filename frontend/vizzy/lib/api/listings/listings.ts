import { getApiUrl } from '@/lib/api/core/client';
import type { Listing } from '@/types/listing';

/**
 * Fetches a specific listing by its ID
 */
export async function fetchListing(id: string): Promise<Listing> {
  try {
    console.log('Fetching listing with ID:', id); // Debug log
    const response = await fetch(getApiUrl(`listings/${id}`));

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData); // Debug log
      throw new Error(`Failed to fetch listing data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Listing data received:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
}
