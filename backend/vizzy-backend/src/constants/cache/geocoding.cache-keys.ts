export const GEOCODING_CACHE_KEYS = {
  FORWARD: (address: string): string => `geocoding:forward:${address}`,
  REVERSE: (lat: number, lon: number): string =>
    `geocoding:reverse:${lat}:${lon}`,
} as const;
