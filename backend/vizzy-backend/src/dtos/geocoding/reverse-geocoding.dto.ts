import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { BaseGeocodingResponse } from './base-geocoding.dto';

/**
 * Schema for reverse geocoding requests
 * Validates that latitude and longitude coordinates are provided
 */
export const reverseGeocodeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

/**
 * Reverse Geocode Data Transfer Object (DTO)
 * Used for validating and transforming reverse geocoding requests
 */
export class ReverseGeocodeDto extends createZodDto(reverseGeocodeSchema) {
  @ApiProperty({
    description: 'Latitude coordinate',
    example: 37.4224764,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -122.0842499,
  })
  longitude: number;
}

/**
 * Response class for reverse geocoding operations
 * Contains address details for the provided coordinates
 */
export class ReverseGeocodingResponse extends BaseGeocodingResponse {
  @ApiProperty({
    description: 'Latitude coordinate that was reverse geocoded',
    example: 37.4224764,
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate that was reverse geocoded',
    example: -122.0842499,
    required: false,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Full formatted address',
    example: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
    required: false,
  })
  fullAddress?: string;

  @ApiProperty({
    description: 'Village name if available',
    example: null,
    required: false,
  })
  village?: string;

  @ApiProperty({
    description: 'Town name if available',
    example: 'Mountain View',
    required: false,
  })
  town?: string;

  @ApiProperty({
    description: 'County name if available',
    example: 'Santa Clara County',
    required: false,
  })
  county?: string;

  @ApiProperty({
    description: 'Country name',
    example: 'United States',
    required: false,
  })
  country?: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2)',
    example: 'us',
    required: false,
  })
  countryCode?: string;
}
