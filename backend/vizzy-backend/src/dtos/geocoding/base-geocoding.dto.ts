import { ApiProperty } from '@nestjs/swagger';

/**
 * Base class for geocoding responses
 * Contains common properties for both forward and reverse geocoding
 */
export class BaseGeocodingResponse {
  @ApiProperty({
    description: 'Error message if geocoding failed',
    required: false,
  })
  error?: string;
}
