import { Redis } from 'ioredis';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';

/**
 * Helper class for managing listing-related caching operations
 * Provides methods for retrieving, storing, and invalidating listing data in Redis
 */
export class ListingCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour
  private static readonly HOME_LISTINGS_CACHE_EXPIRATION = 900;

  /**
   * Retrieves listings from the cache for a specific user
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose listings to retrieve
   * @returns Array of cached listings or null if not found or parsing fails
   */
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

  /**
   * Stores listings in the cache for a specific user
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose listings to cache
   * @param listings - Array of listings to store in cache
   */
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

  /**
   * Retrieves a single listing from the cache by its ID
   * @param redisClient - Redis client instance
   * @param listingId - ID of the listing to retrieve
   * @returns The cached listing or null if not found or parsing fails
   */
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

  /**
   * Stores a single listing in the cache
   * @param redisClient - Redis client instance
   * @param listingId - ID of the listing to cache
   * @param listing - Listing data to store in cache
   */
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

  /**
   * Retrieves home page listings from the cache with optional filtering
   * @param redisClient - Redis client instance
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @param listingType - Optional type of listing to filter by
   * @param search - Optional search term to filter listings
   * @param latitude - Optional latitude for location-based filtering
   * @param longitude - Optional longitude for location-based filtering
   * @param distance - Optional distance in meters for location-based filtering
   * @returns Object containing listings, total pages, and current page or null if not found
   */
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

  /**
   * Stores home page listings in the cache with filtering parameters
   * @param redisClient - Redis client instance
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @param listingType - Optional type of listing to filter by
   * @param search - Optional search term to filter listings
   * @param latitude - Optional latitude for location-based filtering
   * @param longitude - Optional longitude for location-based filtering
   * @param distance - Optional distance in meters for location-based filtering
   * @param data - Object containing listings, total pages, and current page
   */
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

  /**
   * Invalidates (removes) all home listings from the cache
   * @param redisClient - Redis client instance
   */
  static async invalidateHomeListingsCache(redisClient: Redis): Promise<void> {
    // This uses a pattern to delete all home-listings keys
    const keys = await redisClient.keys('home-listings:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }

  /**
   * Retrieves paginated listings for a specific user from the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose listings to retrieve
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Array of cached listings or null if not found or parsing fails
   */
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

  /**
   * Stores paginated listings for a specific user in the cache
   * @param redisClient - Redis client instance
   * @param userId - ID of the user whose listings to cache
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @param listings - Array of listings to store in cache
   */
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

  /**
   * Generic method to retrieve any data from the cache
   * @param redisClient - Redis client instance
   * @param cacheKey - Cache key to retrieve data for
   * @returns Cached data of type T or null if not found or parsing fails
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
   * Generic method to store any data in the cache
   * @param redisClient - Redis client instance
   * @param cacheKey - Cache key to store data under
   * @param data - Data to store in cache
   * @param expirationInSeconds - Cache expiration time in seconds (defaults to CACHE_EXPIRATION)
   */
  static async setCache<T>(
    redisClient: Redis,
    cacheKey: string,
    data: T,
    expirationInSeconds = this.CACHE_EXPIRATION,
  ): Promise<void> {
    await redisClient.set(
      cacheKey,
      JSON.stringify(data),
      'EX',
      expirationInSeconds,
    );
  }
}
