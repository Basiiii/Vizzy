import { Redis } from 'ioredis';
import { Listing } from '@/dtos/listing/listing.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
export class ListingCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  static async getListingsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<Listing[] | null> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedListings = await redisClient.get(cacheKey);

    if (!cachedListings) return null;
    try {
      return JSON.parse(cachedListings) as Listing[];
    } catch (error) {
      console.error('Error parsing cached listings:', error);
      return null;
    }
  }

  static async cacheListings(
    redisClient: Redis,
    userId: string,
    listings: Listing[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(listings),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
}
