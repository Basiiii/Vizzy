import { Redis } from 'ioredis';

/**
 * Helper class for managing global cache operations using Redis
 */
export class GlobalCacheHelper {
  /**
   * Default expiration time for cached items in seconds (1 hour)
   * @private
   * @readonly
   */
  private static readonly DEFAULT_EXPIRATION = 3600;

  /**
   * Retrieves data from the Redis cache
   * @template T - The type of data to be retrieved
   * @param {Redis} redisClient - The Redis client instance
   * @param {string} cacheKey - The key to lookup in cache
   * @returns {Promise<T | null>} The cached data cast to type T, or null if not found or on parse error
   */
  static async getFromCache<T>(
    redisClient: Redis,
    cacheKey: string,
  ): Promise<T | null> {
    const cachedData = await redisClient.get(cacheKey);

    if (!cachedData) return null;

    try {
      return JSON.parse(cachedData) as T;
    } catch (error) {
      console.error('Error parsing cached data:', error);
      return null;
    }
  }

  /**
   * Stores data in the Redis cache
   * @template T - The type of data to be stored
   * @param {Redis} redisClient - The Redis client instance
   * @param {string} cacheKey - The key under which to store the data
   * @param {T} data - The data to be stored
   * @param {number} [expirationInSeconds=DEFAULT_EXPIRATION] - Cache expiration time in seconds
   * @returns {Promise<void>}
   */
  static async setCache<T>(
    redisClient: Redis,
    cacheKey: string,
    data: T,
    expirationInSeconds = this.DEFAULT_EXPIRATION,
  ): Promise<void> {
    await redisClient.set(
      cacheKey,
      JSON.stringify(data),
      'EX',
      expirationInSeconds,
    );
  }

  /**
   * Removes data from the Redis cache
   * @param {Redis} redisClient - The Redis client instance
   * @param {string} cacheKey - The key to remove from cache
   * @returns {Promise<void>}
   */
  static async invalidateCache(
    redisClient: Redis,
    cacheKey: string,
  ): Promise<void> {
    await redisClient.del(cacheKey);
  }
}
