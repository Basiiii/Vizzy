import { Redis } from 'ioredis';
import { Profile } from '@/dtos/profile/profile.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
export class ProfileCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour
  private static logger: Logger;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    ProfileCacheHelper.logger = logger;
  }

  static async getProfileFromCache(
    redisClient: Redis,
    username: string,
  ): Promise<Profile | null> {
    ProfileCacheHelper.logger.info(`Checking cache for username: ${username}`);
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    const cachedProfile = await redisClient.get(cacheKey);

    if (!cachedProfile) {
      ProfileCacheHelper.logger.info(`Cache miss for username: ${username}`);
      return null;
    }
    try {
      ProfileCacheHelper.logger.info(`Cache hit for username: ${username}`);
      return JSON.parse(cachedProfile) as Profile;
    } catch (error) {
      ProfileCacheHelper.logger.error(
        `Error parsing cached profile for username: ${username}`,
        { error },
      );
      return null;
    }
  }

  static async cacheProfile(
    redisClient: Redis,
    username: string,
    profile: Profile,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    await redisClient.set(
      cacheKey,
      JSON.stringify(profile),
      'EX',
      this.CACHE_EXPIRATION,
    );
    ProfileCacheHelper.logger.info(
      `User data cached for username: ${username}`,
    );
  }

  static async invalidateCache(
    redisClient: Redis,
    username: string,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_INFO(username);
    await redisClient.del(cacheKey);
    ProfileCacheHelper.logger.info(
      `Cache invalidated for username: ${username}`,
    );
  }
}
