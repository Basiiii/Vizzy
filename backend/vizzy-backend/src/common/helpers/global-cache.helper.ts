import { Redis } from 'ioredis';

export class GlobalCacheHelper {
  private static readonly DEFAULT_EXPIRATION = 3600; // 1 hour

  /**
   * Generic method to get data from cache
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
   * Generic method to set data in cache
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
   * Generic method to invalidate cache
   */
  static async invalidateCache(
    redisClient: Redis,
    cacheKey: string,
  ): Promise<void> {
    await redisClient.del(cacheKey);
  }
}
