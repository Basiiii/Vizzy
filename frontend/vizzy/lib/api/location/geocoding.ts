import { getApiUrl, createAuthHeaders } from '@/lib/api/core/client';
import { tryCatch, type Result } from '@/lib/utils/try-catch';
import { GeocodingResponse, LocationValidationResult } from '@/types/location';

/**
 * Fetches location details from the provided country and village text
 *
 * @param country - The country text input
 * @param village - The village text input
 * @returns Promise<Result<LocationValidationResult>> with the validated location data or error
 */
export async function fetchLocationDetails(
  country: string,
  village: string,
): Promise<Result<LocationValidationResult>> {
  return tryCatch(
    (async () => {
      // Validate inputs first
      if (!country.trim() || !village.trim()) {
        return {
          country: country.trim(),
          village: village.trim(),
          valid: false,
        };
      }

      // Combine village and country for the address
      const address = `${village} ${country}`.trim();

      // Get geocoding data
      const geoResult = await fetchGeocodingData(address);

      if (geoResult.error || !geoResult.data) {
        return {
          country: country.trim(),
          village: village.trim(),
          valid: false,
        };
      }

      return {
        country: country.trim(),
        village: village.trim(),
        fullAddress: geoResult.data.fullAddress,
        latitude: geoResult.data.latitude,
        longitude: geoResult.data.longitude,
        valid: true,
      };
    })(),
  );
}

/**
 * Fetches geocoding data for an address
 *
 * @param address - The address to geocode
 * @returns Promise<Result<GeocodingResponse>> with the geocoding response or error
 */
export async function fetchGeocodingData(
  address: string,
): Promise<Result<GeocodingResponse>> {
  return tryCatch(
    (async () => {
      const response = await fetch(getApiUrl('geocoding/forward'), {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ address }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to get location coordinates',
        );
      }

      return await response.json();
    })(),
  );
}
