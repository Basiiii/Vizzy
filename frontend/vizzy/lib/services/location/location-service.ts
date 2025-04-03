import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';

/**
 * Response from the geocoding API
 */
export interface GeocodingResponse {
  latitude: number;
  longitude: number;
  fullAddress: string;
}

/**
 * Location validation result
 */
export interface LocationValidationResult {
  country: string;
  village: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  valid: boolean;
}

/**
 * Fetches location details from the provided country and village text
 *
 * @param country - The country text input
 * @param village - The village text input
 * @returns Promise with the validated location data
 */
export async function fetchLocationDetails(
  country: string,
  village: string,
): Promise<LocationValidationResult> {
  // Validate inputs first
  if (!country.trim() || !village.trim()) {
    return {
      country: country.trim(),
      village: village.trim(),
      valid: false,
    };
  }

  try {
    // Combine village and country for the address
    const address = `${village} ${country}`.trim();

    // Get geocoding data
    const locationData = await fetchGeocodingData(address);

    return {
      country: country.trim(),
      village: village.trim(),
      fullAddress: locationData.fullAddress,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      valid: true,
    };
  } catch (error) {
    console.error('Error fetching location details:', error);
    return {
      country: country.trim(),
      village: village.trim(),
      valid: false,
    };
  }
}

/**
 * Fetches geocoding data for an address
 *
 * @param address - The address to geocode
 * @returns Promise with the geocoding response
 */
export async function fetchGeocodingData(
  address: string,
): Promise<GeocodingResponse> {
  const response = await fetch(getApiUrl('geocoding/forward'), {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify({ address }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get location coordinates');
  }

  return await response.json();
}
