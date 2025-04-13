import { Redis } from 'ioredis';
import { Profile } from '@/dtos/profile/profile.dto';

/**
 * Helper class for profile caching operations
 * Manages storing, retrieving, and invalidating profile data in Redis
 */
export class ProfileCacheHelper {
  /** Cache expiration time in seconds */
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  /**
   * Retrieves a profile from the cache
   * @param redisClient - Redis client instance
   * @param username - Username to look up in cache
   * @returns The cached profile if found, null otherwise
   */
  static async getProfileFromCache(
    redisClient: Redis,
    username: string,
  ): Promise<Profile | null> {
    const cacheKey = this.getProfileCacheKey(username);
    const cachedData = await redisClient.get(cacheKey);

    if (!cachedData) return null;
    return JSON.parse(cachedData) as Profile;
  }

  /**
   * Stores a profile in the cache
   * @param redisClient - Redis client instance
   * @param username - Username to use as cache key
   * @param profile - Profile data to cache
   */
  static async cacheProfile(
    redisClient: Redis,
    username: string,
    profile: Profile,
  ): Promise<void> {
    const cacheKey = this.getProfileCacheKey(username);
    await redisClient.set(
      cacheKey,
      JSON.stringify(profile),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }

  /**
   * Invalidates (removes) a profile from the cache
   * @param redisClient - Redis client instance
   * @param username - Username of the profile to invalidate
   */
  static async invalidateCache(
    redisClient: Redis,
    username: string,
  ): Promise<void> {
    const cacheKey = this.getProfileCacheKey(username);
    await redisClient.del(cacheKey);
  }

  /**
   * Generates a standardized cache key for profiles
   * @param username - Username to create key for
   * @returns Formatted cache key
   */
  private static getProfileCacheKey(username: string): string {
    return `profile:${username.toLowerCase()}`;
  }
}
