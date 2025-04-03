import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ForwardGeocodingResponse,
  ReverseGeocodingResponse,
} from '@/dtos/geocoding/geocoding.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class GeocodingService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://geocode.maps.co';

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.apiKey = this.configService.get<string>('GEOCODING_API_KEY');
    if (!this.apiKey) {
      this.logger.error(
        'GEOCODING_API_KEY is not defined in environment variables',
      );
      throw new Error(
        'GEOCODING_API_KEY is not defined in environment variables',
      );
    }
  }

  async forwardGeocode(address: string): Promise<ForwardGeocodingResponse> {
    try {
      this.logger.info(`Attempting to forward geocode address: ${address}`);
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodedAddress}&api_key=${this.apiKey}`,
      );

      if (!response.ok) {
        this.logger.error(`Forward geocoding HTTP error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || data.length === 0) {
        this.logger.warn(`No results found for address: ${address}`);
        return { error: 'No results found for the given address' };
      }

      const result = data[0];
      this.logger.info(`Successfully geocoded address: ${address}`);
      return {
        latitude: parseFloat(String(result.lat)),
        longitude: parseFloat(String(result.lon)),
        fullAddress: result.display_name,
      };
    } catch (error) {
      this.logger.error(`Failed to geocode address: ${error.message}`);
      throw new HttpException(
        'Failed to geocode address',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodingResponse> {
    try {
      this.logger.info(
        `Attempting to reverse geocode coordinates: ${latitude}, ${longitude}`,
      );
      const response = await fetch(
        `${this.baseUrl}/reverse?lat=${latitude}&lon=${longitude}&api_key=${this.apiKey}`,
      );

      if (!response.ok) {
        this.logger.error(`Reverse geocoding HTTP error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data) {
        this.logger.warn(
          `No results found for coordinates: ${latitude}, ${longitude}`,
        );
        return { error: 'No results found for the given coordinates' };
      }

      this.logger.info(
        `Successfully reverse geocoded coordinates: ${latitude}, ${longitude}`,
      );
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
      this.logger.error(
        `Failed to reverse geocode coordinates: ${error.message}`,
      );
      throw new HttpException(
        'Failed to reverse geocode coordinates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
