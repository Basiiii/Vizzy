import { getApiUrl } from '../core/client';

export interface RentalAvailability {
  start_date: string;
  end_date: string;
}

export async function getRentalAvailability(
  listingId: number,
): Promise<RentalAvailability[]> {
  const response = await fetch(
    getApiUrl(`listings/${listingId}/availability`),
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to get rental availability');
  }

  return await response.json();
}
