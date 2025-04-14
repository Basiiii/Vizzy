import { Redis } from 'ioredis';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { UserLocationDto } from '@/dtos/user/user-location.dto';

/**
 * Helper class for managing user-related caching operations
 * Provides methods for retrieving, storing, and managing user data in Redis
 */
export class UserCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  /**
   * Retrieves a user from the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user to retrieve
   * @returns The cached user or null if not found or parsing fails
   */
  static async getUserFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<User | null> {
    const cacheKey = CACHE_KEYS.BASIC_USER_INFO(userId);
    const cachedUser = await redisClient.get(cacheKey);

    if (!cachedUser) return null;

    try {
      return JSON.parse(cachedUser) as User;
    } catch (error) {
      console.error('Error parsing cached user:', error);
      return null;
    }
  }

  /**
   * Stores a user in the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user to cache
   * @param userData - User data to store in cache
   */
  static async cacheUser(
    redisClient: Redis,
    userId: string,
    userData: User,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.BASIC_USER_INFO(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(userData),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }

  /**
   * Retrieves a user lookup from the cache by username
   * @param redisClient - Redis client instance
   * @param username - Username to lookup
   * @returns The cached user lookup data or null if not found or parsing fails
   */
  static async getUserLookupFromCache(
    redisClient: Redis,
    username: string,
  ): Promise<UserLookupDto | null> {
    const cacheKey = CACHE_KEYS.USERNAME_LOOKUP(username);
    const cachedLookup = await redisClient.get(cacheKey);

    if (!cachedLookup) return null;

    try {
      return JSON.parse(cachedLookup) as UserLookupDto;
    } catch (error) {
      console.error('Error parsing cached lookup:', error);
      return null;
    }
  }

  /**
   * Stores a user lookup in the cache
   * @param redisClient - Redis client instance
   * @param username - Username to associate with the lookup data
   * @param lookupData - User lookup data to store in cache
   */
  static async cacheLookup(
    redisClient: Redis,
    username: string,
    lookupData: UserLookupDto,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.USERNAME_LOOKUP(username);
    await redisClient.set(
      cacheKey,
      JSON.stringify(lookupData),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }

  /**
   * Retrieves a user's location from the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose location to retrieve
   * @returns The cached location data or null if not found or parsing fails
   */
  static async getUserLocationFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<UserLocationDto | null> {
    const cacheKey = CACHE_KEYS.USER_LOCATION(userId);
    const cachedLocation = await redisClient.get(cacheKey);

    if (!cachedLocation) return null;

    try {
      return JSON.parse(cachedLocation) as UserLocationDto;
    } catch (error) {
      console.error('Error parsing cached location:', error);
      return null;
    }
  }

  /**
   * Stores a user's location in the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose location to cache
   * @param locationData - Location data to store in cache
   */
  static async cacheUserLocation(
    redisClient: Redis,
    userId: string,
    locationData: UserLocationDto,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.USER_LOCATION(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(locationData),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
}
