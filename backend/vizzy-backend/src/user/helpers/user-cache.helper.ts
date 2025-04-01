import { Redis } from 'ioredis';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
export class UserCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour
  private static logger: Logger;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    UserCacheHelper.logger = logger; // Assign to static property
  }

  static async getUserFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<User | null> {
    const cacheKey = CACHE_KEYS.BASIC_USER_INFO(userId);
    UserCacheHelper.logger.info(`Checking cache for userId: ${userId}`);
    const cachedUser = await redisClient.get(cacheKey);

    if (!cachedUser) {
      UserCacheHelper.logger.info(`Cache miss for userId: ${userId}`);
      return null;
    }

    try {
      UserCacheHelper.logger.info(`Cache hit for userId: ${userId}`);
      return JSON.parse(cachedUser) as User;
    } catch (error) {
      UserCacheHelper.logger.error(
        `Error parsing cached user for userId: ${userId}`,
        { error },
      );
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
    UserCacheHelper.logger.info(`User data cached for userId: ${userId}`);
  }

  static async getUserLookupFromCache(
    redisClient: Redis,
    username: string,
  ): Promise<UserLookupDto | null> {
    const cacheKey = CACHE_KEYS.USERNAME_LOOKUP(username);
    UserCacheHelper.logger.info(`Checking cache for username: ${username}`);

    const cachedLookup = await redisClient.get(cacheKey);

    if (!cachedLookup) {
      UserCacheHelper.logger.info(`Cache miss for username: ${username}`);
      return null;
    }

    try {
      UserCacheHelper.logger.info(`Cache hit for username: ${username}`);
      return JSON.parse(cachedLookup) as UserLookupDto;
    } catch (error) {
      UserCacheHelper.logger.error(
        `Error parsing cached lookup for username: ${username}`,
        { error },
      );
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
    UserCacheHelper.logger.info(
      `Username lookup cached for username: ${username}`,
    );
  }
}
