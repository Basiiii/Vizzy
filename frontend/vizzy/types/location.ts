export interface GeocodingResponse {
  latitude: number;
  longitude: number;
  fullAddress: string;
}

export interface LocationValidationResult {
  country: string;
  village: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  valid: boolean;
}
