import { Redis } from 'ioredis';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { ForwardGeocodingResponse } from '@/dtos/geocoding/forward-geocoding.dto';
import { ReverseGeocodingResponse } from '@/dtos/geocoding/reverse-geocoding.dto';
import { Logger } from 'winston';

/**
 * Helper class for managing geocoding-related caching operations
 * Provides methods for retrieving and storing geocoding results in Redis
 */
export class GeocodingCacheHelper {
  /**
   * Retrieves forward geocoding results from cache
   * @param redisClient - Redis client instance
   * @param address - Address that was geocoded
   * @param logger - Winston logger instance
   * @returns The cached geocoding result or null if not found
   */
  static async getForwardGeocodingFromCache(
    redisClient: Redis,
    address: string,
    logger: Logger,
  ): Promise<ForwardGeocodingResponse | null> {
    const cacheKey = CACHE_KEYS.FORWARD_GEOCODING(address);
    const cachedResult = await redisClient.get(cacheKey);

    if (!cachedResult) {
      return null;
    }

    try {
      logger.info(`Cache hit for forward geocoding address: ${address}`);
      return JSON.parse(cachedResult) as ForwardGeocodingResponse;
    } catch (error) {
      logger.error(
        `Error parsing cached forward geocoding result: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Retrieves reverse geocoding results from cache
   * @param redisClient - Redis client instance
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param logger - Winston logger instance
   * @returns The cached geocoding result or null if not found
   */
  static async getReverseGeocodingFromCache(
    redisClient: Redis,
    latitude: number,
    longitude: number,
    logger: Logger,
  ): Promise<ReverseGeocodingResponse | null> {
    const cacheKey = CACHE_KEYS.REVERSE_GEOCODING(latitude, longitude);
    const cachedResult = await redisClient.get(cacheKey);

    if (!cachedResult) {
      return null;
    }

    try {
      logger.info(
        `Cache hit for reverse geocoding coordinates: ${latitude}, ${longitude}`,
      );
      return JSON.parse(cachedResult) as ReverseGeocodingResponse;
    } catch (error) {
      logger.error(
        `Error parsing cached reverse geocoding result: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Caches forward geocoding results
   * @param redisClient - Redis client instance
   * @param address - Address that was geocoded
   * @param result - Geocoding result to cache
   * @param expirationTime - Cache expiration time in seconds
   */
  static async cacheForwardGeocoding(
    redisClient: Redis,
    address: string,
    result: ForwardGeocodingResponse,
    expirationTime: number,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.FORWARD_GEOCODING(address);
    await redisClient.set(
      cacheKey,
      JSON.stringify(result),
      'EX',
      expirationTime,
    );
  }

  /**
   * Caches reverse geocoding results
   * @param redisClient - Redis client instance
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param result - Geocoding result to cache
   * @param expirationTime - Cache expiration time in seconds
   */
  static async cacheReverseGeocoding(
    redisClient: Redis,
    latitude: number,
    longitude: number,
    result: ReverseGeocodingResponse,
    expirationTime: number,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.REVERSE_GEOCODING(latitude, longitude);
    await redisClient.set(
      cacheKey,
      JSON.stringify(result),
      'EX',
      expirationTime,
    );
  }
}
