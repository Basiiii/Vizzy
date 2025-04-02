import { Redis } from 'ioredis';
import { Listing } from '@/dtos/listing/listing.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
export class ListingCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour
  private static logger: Logger;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) logger: Logger) {
    ListingCacheHelper.logger = logger;
  }

  static async getListingsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<Listing[] | null> {
    ListingCacheHelper.logger.info(`Checking cache for userId: ${userId}`);
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedListings = await redisClient.get(cacheKey);

    if (!cachedListings) {
      ListingCacheHelper.logger.info(`Cache miss for userId: ${userId}`);
      return null;
    }
    try {
      ListingCacheHelper.logger.info(`Cache hit for userId: ${userId}`);
      return JSON.parse(cachedListings) as Listing[];
    } catch (error) {
      ListingCacheHelper.logger.error(
        `Error parsing cached listings for userId: ${userId}`,
        { error },
      );
      return null;
    }
  }

  static async cacheListings(
    redisClient: Redis,
    userId: string,
    listings: Listing[],
  ): Promise<void> {
    ListingCacheHelper.logger.info(`Caching listings for userId: ${userId}`);
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(listings),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
}
