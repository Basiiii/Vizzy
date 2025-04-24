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
    this.validateCoordinatesPresence(latitude, longitude);
    this.validateCoordinatesType(latitude, longitude);
    this.validateLatitude(latitude);
    this.validateLongitude(longitude);
  }

  /**
   * Validates that both latitude and longitude coordinates are present
   * @param latitude - The latitude coordinate to validate
   * @param longitude - The longitude coordinate to validate
   * @throws {GeocodingValidationException} If either coordinate is undefined
   * @private
   */
  private static validateCoordinatesPresence(
    latitude: number,
    longitude: number,
  ): void {
    if (latitude === undefined || longitude === undefined) {
      throw new GeocodingValidationException(
        'Latitude and longitude are required',
      );
    }
  }

  /**
   * Validates that both latitude and longitude coordinates are valid numbers
   * @param latitude - The latitude coordinate to validate
   * @param longitude - The longitude coordinate to validate
   * @throws {GeocodingValidationException} If either coordinate is NaN
   * @private
   */
  private static validateCoordinatesType(
    latitude: number,
    longitude: number,
  ): void {
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new GeocodingValidationException(
        'Latitude and longitude must be numbers',
      );
    }
  }

  /**
   * Validates that the latitude coordinate is within valid range (-90 to 90 degrees)
   * @param latitude - The latitude coordinate to validate
   * @throws {GeocodingValidationException} If latitude is outside valid range
   * @private
   */
  private static validateLatitude(latitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw new GeocodingValidationException(
        'Latitude must be between -90 and 90',
      );
    }
  }

  /**
   * Validates that the longitude coordinate is within valid range (-180 to 180 degrees)
   * @param longitude - The longitude coordinate to validate
   * @throws {GeocodingValidationException} If longitude is outside valid range
   * @private
   */
  private static validateLongitude(longitude: number): void {
    if (longitude < -180 || longitude > 180) {
      throw new GeocodingValidationException(
        'Longitude must be between -180 and 180',
      );
    }
  }
}
