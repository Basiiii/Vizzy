import { Redis } from 'ioredis';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';

export class ListingCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  static async getListingsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<ListingBasic[] | null> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedListings = await redisClient.get(cacheKey);

    if (!cachedListings) return null;

    try {
      return JSON.parse(cachedListings) as ListingBasic[];
    } catch (error) {
      console.error('Error parsing cached listings:', error);
      return null;
    }
  }

  static async cacheListings(
    redisClient: Redis,
    userId: string,
    listings: ListingBasic[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(listings),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }

  static async getListingFromCache(
    redisClient: Redis,
    listingId: number,
  ): Promise<Listing | null> {
    const cacheKey = CACHE_KEYS.LISTING_DETAIL(listingId);
    const cachedListing = await redisClient.get(cacheKey);

    if (!cachedListing) return null;

    try {
      return JSON.parse(cachedListing) as Listing;
    } catch (error) {
      console.error('Error parsing cached listing:', error);
      return null;
    }
  }

  static async cacheListing(
    redisClient: Redis,
    listingId: number,
    listing: Listing,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.LISTING_DETAIL(listingId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(listing),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
}
