import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FavoritesDatabaseHelper } from './helpers/favorites-database.helper';
import { RedisService } from '@/redis/redis.service';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { FAVORITES_CACHE_KEYS } from '@/constants/cache/favorites.cache-keys';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';

/**
 * Service for handling favorites-related operations
 */
@Injectable()
export class FavoritesService {
  private supabase: SupabaseClient;
  private readonly CACHE_EXPIRATION = 300; // 5 minutes

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.supabase = this.supabaseService.getAdminClient();
  }

  /**
   * Retrieves all favorites for a user
   * @param userId - The ID of the user
   * @param limit - Number of items to return
   * @param offset - Number of items to skip
   * @returns Promise<ListingBasic[]>
   */
  async findAll(
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<ListingBasic[]> {
    this.logger.info(
      `Service: Finding favorites for user ${userId} with limit ${limit} and offset ${offset}`,
    );

    const cacheKey = FAVORITES_CACHE_KEYS.USER_LIST(userId, limit, offset);
    const redisClient = this.redisService.getRedisClient();

    // Try to get from cache first
    const cachedFavorites = await GlobalCacheHelper.getFromCache<
      ListingBasic[]
    >(redisClient, cacheKey);

    if (cachedFavorites) {
      this.logger.info(
        `Service: Retrieved favorites for user ${userId} from cache`,
      );
      return cachedFavorites;
    }

    try {
      // If not in cache, fetch from database
      const favorites = await FavoritesDatabaseHelper.fetchUserFavorites(
        this.supabase,
        userId,
        limit,
        offset,
      );

      // Store in cache for future requests
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        favorites,
        this.CACHE_EXPIRATION,
      );

      this.logger.info(
        `Service: Found ${favorites.length} favorites for user ${userId}`,
      );
      return favorites;
    } catch (error) {
      this.logger.error(
        `Service: Error fetching favorites for user ${userId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Adds a new favorite for a user
   * @param userId - The ID of the user
   * @param listingId - The ID of the listing to favorite
   * @returns Promise<void>
   */
  async addFavorite(userId: string, listingId: number): Promise<void> {
    this.logger.info(
      `Service: Adding favorite for user ${userId} and listing ${listingId}`,
    );

    try {
      const insertedFavorite = await FavoritesDatabaseHelper.insertFavorite(
        this.supabase,
        userId,
        listingId,
      );

      if (!insertedFavorite) {
        throw new Error('Failed to insert favorite');
      }

      await this.invalidateUserFavoritesCache(userId);
    } catch (error) {
      this.logger.error(
        `Service: Error adding favorite for user ${userId}:`,
        error,
      );
      throw new HttpException(
        'Failed to add favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Removes a favorite for a user
   * @param userId - The ID of the user
   * @param listingId - The ID of the listing to remove from favorites
   * @returns Promise<void>
   */
  async removeFavorite(userId: string, listingId: number): Promise<void> {
    this.logger.info(
      `Service: Removing favorite ${listingId} for user ${userId}`,
    );

    try {
      await FavoritesDatabaseHelper.deleteFavorite(
        this.supabase,
        listingId,
        userId,
      );

      // Invalidate cache
      await this.invalidateUserFavoritesCache(userId);

      this.logger.info(
        `Service: Successfully removed favorite ${listingId} for user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Service: Error removing favorite ${listingId} for user ${userId}:`,
        error,
      );
      throw new HttpException(
        'Failed to remove favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Invalidates the favorites cache for a user
   * @param userId - The ID of the user
   */
  private async invalidateUserFavoritesCache(userId: string): Promise<void> {
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = FAVORITES_CACHE_KEYS.USER_LIST(userId);
    await GlobalCacheHelper.invalidateCache(redisClient, cacheKey);
    this.logger.info(`Service: Invalidated favorites cache for user ${userId}`);
  }

  /**
   * Checks if a listing is favorited by a user
   * @param userId - The ID of the user
   * @param listingId - The ID of the listing to check
   * @returns Promise<boolean>
   */
  async isListingFavorited(
    userId: string,
    listingId: number,
  ): Promise<boolean> {
    this.logger.info(
      `Service: Checking if listing ${listingId} is favorited by user ${userId}`,
    );

    try {
      const isFavorited = await FavoritesDatabaseHelper.isListingFavorited(
        this.supabase,
        userId,
        listingId,
      );

      this.logger.info(
        `Service: Listing ${listingId} is ${isFavorited ? '' : 'not '}favorited by user ${userId}`,
      );
      return isFavorited;
    } catch (error) {
      this.logger.error(
        `Service: Error checking if listing ${listingId} is favorited by user ${userId}:`,
        error,
      );
      throw new HttpException(
        'Failed to check favorite status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
