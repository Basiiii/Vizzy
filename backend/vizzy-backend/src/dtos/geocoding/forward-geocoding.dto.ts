import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';
import { BaseGeocodingResponse } from './base-geocoding.dto';

/**
 * Schema for forward geocoding requests
 * Validates that an address is provided
 */
export const forwardGeocodeSchema = z.object({
  address: z.string().min(1, 'Address is required'),
});

/**
 * Forward Geocode Data Transfer Object (DTO)
 * Used for validating and transforming forward geocoding requests
 */
export class ForwardGeocodeDto extends createZodDto(forwardGeocodeSchema) {
  @ApiProperty({
    description: 'Address to be geocoded',
    example: '1600 Amphitheatre Parkway, Mountain View, CA',
  })
  address: string;
}

/**
 * Response class for forward geocoding operations
 * Contains geographic coordinates and address information
 */
export class ForwardGeocodingResponse extends BaseGeocodingResponse {
  @ApiProperty({
    description: 'Latitude coordinate of the geocoded address',
    example: 37.4224764,
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate of the geocoded address',
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
}
