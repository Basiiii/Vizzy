import { Logger } from 'winston';
import { ForwardGeocodingResponse } from '@/dtos/geocoding/forward-geocoding.dto';
import { ReverseGeocodingResponse } from '@/dtos/geocoding/reverse-geocoding.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Helper class for making geocoding API requests
 * Handles communication with external geocoding services
 */
export class GeocodingApiHelper {
  /**
   * Makes a forward geocoding API request
   * @param baseUrl - Base URL of the geocoding API
   * @param apiKey - API key for the geocoding service
   * @param address - Address to geocode
   * @param logger - Winston logger instance
   * @returns Geocoding result with coordinates
   */
  static async makeForwardGeocodingRequest(
    baseUrl: string,
    apiKey: string,
    address: string,
    logger: Logger,
  ): Promise<ForwardGeocodingResponse> {
    try {
      logger.info(`Making forward geocoding request for address: ${address}`);
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `${baseUrl}/search?q=${encodedAddress}&api_key=${apiKey}`,
      );

      if (!response.ok) {
        logger.error(`Forward geocoding HTTP error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        logger.warn(`No results found for address: ${address}`);
        return { error: 'No results found for the given address' };
      }

      const result = data[0];
      return {
        latitude: parseFloat(String(result.lat)),
        longitude: parseFloat(String(result.lon)),
        fullAddress: result.display_name,
      };
    } catch (error) {
      logger.error(`Failed to geocode address: ${error.message}`);
      throw new HttpException(
        'Failed to geocode address',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Makes a reverse geocoding API request
   * @param baseUrl - Base URL of the geocoding API
   * @param apiKey - API key for the geocoding service
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param logger - Winston logger instance
   * @returns Geocoding result with address information
   */
  static async makeReverseGeocodingRequest(
    baseUrl: string,
    apiKey: string,
    latitude: number,
    longitude: number,
    logger: Logger,
  ): Promise<ReverseGeocodingResponse> {
    try {
      logger.info(
        `Making reverse geocoding request for coordinates: ${latitude}, ${longitude}`,
      );
      const response = await fetch(
        `${baseUrl}/reverse?lat=${latitude}&lon=${longitude}&api_key=${apiKey}`,
      );

      if (!response.ok) {
        logger.error(`Reverse geocoding HTTP error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data) {
        logger.warn(
          `No results found for coordinates: ${latitude}, ${longitude}`,
        );
        return { error: 'No results found for the given coordinates' };
      }

      return {
        latitude,
        longitude,
        fullAddress: data.display_name,
        village: data.address?.village,
        town: data.address?.town,
        county: data.address?.county,
        country: data.address?.country,
        countryCode: data.address?.country_code,
      };
    } catch (error) {
      logger.error(`Failed to reverse geocode coordinates: ${error.message}`);
      throw new HttpException(
        'Failed to reverse geocode coordinates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
