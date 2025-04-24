/**
 * Cache key constants for geocoding operations
 */
export const GEOCODING_CACHE_KEYS = {
  /**
   * Generates a cache key for forward geocoding (address to coordinates)
   * @param address - The address string to geocode
   * @returns A unique cache key string for the forward geocoding operation
   */
  FORWARD: (address: string): string => `geocoding:forward:${address}`,

  /**
   * Generates a cache key for reverse geocoding (coordinates to address)
   * @param lat - The latitude coordinate
   * @param lon - The longitude coordinate
   * @returns A unique cache key string for the reverse geocoding operation
   */
  REVERSE: (lat: number, lon: number): string =>
    `geocoding:reverse:${lat}:${lon}`,
} as const;
