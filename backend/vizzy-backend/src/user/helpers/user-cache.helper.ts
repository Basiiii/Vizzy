import { Redis } from 'ioredis';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
export class UserCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

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
}
