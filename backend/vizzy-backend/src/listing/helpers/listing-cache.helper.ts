import { Redis } from 'ioredis';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';

export class ListingCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour
  private static readonly HOME_LISTINGS_CACHE_EXPIRATION = 900;

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

  static async getHomeListingsFromCache(
    redisClient: Redis,
    page: number,
    limit: number,
    listingType?: string,
    search?: string,
    latitude?: number,
    longitude?: number,
    distance?: number,
  ): Promise<{
    listings: ListingBasic[];
    totalPages: number;
    currentPage: number;
  } | null> {
    const cacheKey = CACHE_KEYS.HOME_LISTINGS(
      page,
      limit,
      listingType,
      search,
      latitude,
      longitude,
      distance,
    );
    const cachedData = await redisClient.get(cacheKey);

    if (!cachedData) return null;

    try {
      return JSON.parse(cachedData) as {
        listings: ListingBasic[];
        totalPages: number;
        currentPage: number;
      };
    } catch (error) {
      console.error('Error parsing cached home listings:', error);
      return null;
    }
  }

  static async cacheHomeListings(
    redisClient: Redis,
    page: number,
    limit: number,
    listingType: string | undefined,
    search: string | undefined,
    latitude: number | undefined,
    longitude: number | undefined,
    distance: number | undefined,
    data: { listings: ListingBasic[]; totalPages: number; currentPage: number },
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.HOME_LISTINGS(
      page,
      limit,
      listingType,
      search,
      latitude,
      longitude,
      distance,
    );
    await redisClient.set(
      cacheKey,
      JSON.stringify(data),
      'EX',
      this.HOME_LISTINGS_CACHE_EXPIRATION,
    );
  }

  static async invalidateHomeListingsCache(redisClient: Redis): Promise<void> {
    // This uses a pattern to delete all home-listings keys
    const keys = await redisClient.keys('home-listings:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }

  static async getUserListingsFromCache(
    redisClient: Redis,
    userId: string,
    page: number,
    limit: number,
  ): Promise<ListingBasic[] | null> {
    const cacheKey = CACHE_KEYS.USER_LISTINGS_PAGINATED(userId, page, limit);
    const cachedListings = await redisClient.get(cacheKey);

    if (!cachedListings) return null;

    try {
      return JSON.parse(cachedListings) as ListingBasic[];
    } catch (error) {
      console.error('Error parsing cached user listings:', error);
      return null;
    }
  }

  static async cacheUserListings(
    redisClient: Redis,
    userId: string,
    page: number,
    limit: number,
    listings: ListingBasic[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.USER_LISTINGS_PAGINATED(userId, page, limit);
    await redisClient.set(
      cacheKey,
      JSON.stringify(listings),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
}
