import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const forwardGeocodeSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

export const reverseGeocodeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export class ForwardGeocodeDto extends createZodDto(forwardGeocodeSchema) {}
export class ReverseGeocodeDto extends createZodDto(reverseGeocodeSchema) {}

interface BaseGeocodingResponse {
  error?: string;
}

export interface ForwardGeocodingResponse extends BaseGeocodingResponse {
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}

export interface ReverseGeocodingResponse extends BaseGeocodingResponse {
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
  village?: string;
  town?: string;
  county?: string;
  country?: string;
  countryCode?: string;
}
