import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception for geocoding validation errors
 */
export class GeocodingValidationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Helper class for validating geocoding inputs
 */
export class GeocodingValidator {
  /**
   * Validates an address for forward geocoding
   * @param address - Address to validate
   * @throws GeocodingValidationException if address is invalid
   */
  static validateAddress(address: string): void {
    if (!address || address.trim().length === 0) {
      throw new GeocodingValidationException('Address cannot be empty');
    }
  }

  /**
   * Validates coordinates for reverse geocoding
   * @param latitude - Latitude coordinate to validate
   * @param longitude - Longitude coordinate to validate
   * @throws GeocodingValidationException if coordinates are invalid
   */
  static validateCoordinates(latitude: number, longitude: number): void {
    if (latitude === undefined || longitude === undefined) {
      throw new GeocodingValidationException(
        'Latitude and longitude are required',
      );
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new GeocodingValidationException(
        'Latitude and longitude must be numbers',
      );
    }

    if (latitude < -90 || latitude > 90) {
      throw new GeocodingValidationException(
        'Latitude must be between -90 and 90',
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw new GeocodingValidationException(
        'Longitude must be between -180 and 180',
      );
    }
  }
}
