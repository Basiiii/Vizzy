import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { RedisService } from '@/redis/redis.service';
import { ForwardGeocodingResponse } from '@/dtos/geocoding/forward-geocoding.dto';
import { ReverseGeocodingResponse } from '@/dtos/geocoding/reverse-geocoding.dto';
import { GeocodingCacheHelper } from './helpers/geocoding-cache.helper';
import { GeocodingApiHelper } from './helpers/geocoding-api.helper';
import { GeocodingValidator } from './helpers/geocoding-validator.helper';

/**
 * Service responsible for geocoding operations
 * Handles forward and reverse geocoding with caching support
 */
@Injectable()
export class GeocodingService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly CACHE_EXPIRATION = 86400; // 24 hours

  /**
   * Creates an instance of GeocodingService
   * @param configService - Service for accessing configuration values
   * @param redisService - Service for Redis caching operations
   * @param logger - Winston logger instance
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.apiKey = this.configService.get<string>('GEOCODING_API_KEY');
    this.baseUrl = this.configService.get<string>('GEOCODING_BASE_API_URL');

    if (!this.apiKey) {
      this.logger.error(
        'GEOCODING_API_KEY is not defined in environment variables',
      );
      throw new Error(
        'GEOCODING_API_KEY is not defined in environment variables',
      );
    }

    if (!this.baseUrl) {
      this.logger.error(
        'GEOCODING_BASE_API_URL is not defined in environment variables',
      );
      throw new Error(
        'GEOCODING_BASE_API_URL is not defined in environment variables',
      );
    }
  }

  /**
   * Converts an address to geographic coordinates
   * @param address - Address to geocode
   * @returns Geographic coordinates and address information
   */
  async forwardGeocode(address: string): Promise<ForwardGeocodingResponse> {
    GeocodingValidator.validateAddress(address);

    const redisClient = this.redisService.getRedisClient();

    const cachedResult =
      await GeocodingCacheHelper.getForwardGeocodingFromCache(
        redisClient,
        address,
        this.logger,
      );

    if (cachedResult) {
      return cachedResult;
    }

    this.logger.info(`Cache miss for address: ${address}, fetching from API`);

    const geocodingResult =
      await GeocodingApiHelper.makeForwardGeocodingRequest(
        this.baseUrl,
        this.apiKey,
        address,
        this.logger,
      );

    if (!geocodingResult.error) {
      // Cache the result
      await GeocodingCacheHelper.cacheForwardGeocoding(
        redisClient,
        address,
        geocodingResult,
        this.CACHE_EXPIRATION,
      );
    }

    return geocodingResult;
  }

  /**
   * Converts geographic coordinates to an address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Address information for the provided coordinates
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodingResponse> {
    GeocodingValidator.validateCoordinates(latitude, longitude);

    const redisClient = this.redisService.getRedisClient();

    const cachedResult =
      await GeocodingCacheHelper.getReverseGeocodingFromCache(
        redisClient,
        latitude,
        longitude,
        this.logger,
      );

    if (cachedResult) {
      return cachedResult;
    }

    this.logger.info(
      `Cache miss for coordinates: ${latitude}, ${longitude}, fetching from API`,
    );

    const geocodingResult =
      await GeocodingApiHelper.makeReverseGeocodingRequest(
        this.baseUrl,
        this.apiKey,
        latitude,
        longitude,
        this.logger,
      );

    if (!geocodingResult.error) {
      // Cache the result
      await GeocodingCacheHelper.cacheReverseGeocoding(
        redisClient,
        latitude,
        longitude,
        geocodingResult,
        this.CACHE_EXPIRATION,
      );
    }

    return geocodingResult;
  }
}
