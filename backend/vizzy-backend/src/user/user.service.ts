import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { UserDatabaseHelper } from './helpers/user-database.helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserLocationDto } from '@/dtos/user/user-location.dto';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';
import { USER_CACHE_KEYS } from '@/constants/cache/user.cache-keys';

/**
 * Service responsible for managing user operations
 * Handles user-related operations with caching support
 */
@Injectable()
export class UserService {
  private readonly CACHE_EXPIRATION = 3600; // 1 hour

  /**
   * Creates an instance of UserService
   * @param supabaseService - Service for Supabase database operations
   * @param redisService - Service for Redis caching operations
   * @param logger - Winston logger instance
   */
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Retrieves user ID from username with cache support
   * @param username - Username to lookup
   * @returns User lookup information or null if not found
   */
  async getUserIdByUsername(username: string): Promise<UserLookupDto | null> {
    this.logger.info(
      `Using service getUserIDByUsername for username: ${username}`,
    );
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = USER_CACHE_KEYS.LOOKUP(username);

    const cachedLookup = await GlobalCacheHelper.getFromCache<UserLookupDto>(
      redisClient,
      cacheKey,
    );

    if (cachedLookup) {
      this.logger.info(`Cache hit for username: ${username}`);
      return cachedLookup;
    }

    this.logger.info(`Cache miss for username: ${username}, querying database`);
    const supabase = this.supabaseService.getPublicClient();
    const lookupData = await UserDatabaseHelper.getUserByUsername(
      supabase,
      username,
    );

    if (lookupData) {
      this.logger.info(`Caching lookup data for username: ${username}`);
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        lookupData,
        this.CACHE_EXPIRATION,
      );
    } else {
      this.logger.info(
        `User not found in database for username: ${username}, caching null`,
      );
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        null,
        this.CACHE_EXPIRATION / 2,
      );
    }

    return lookupData;
  }

  /**
   * Retrieves user information by ID with cache support
   * @param userId - ID of the user to retrieve
   * @returns User information or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    this.logger.info(`Using service getUserById for ID: ${userId}`);
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = USER_CACHE_KEYS.DETAIL(userId);

    const cachedUser = await GlobalCacheHelper.getFromCache<User>(
      redisClient,
      cacheKey,
    );

    if (cachedUser) {
      this.logger.info(`Cache hit for user ID: ${userId}`);
      return cachedUser;
    }

    this.logger.info(`Cache miss for user ID: ${userId}, querying database`);
    const supabase = this.supabaseService.getPublicClient();
    const userData = await UserDatabaseHelper.getUserById(supabase, userId);

    if (userData) {
      this.logger.info(`Caching user data for user ID: ${userId}`);
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        userData,
        this.CACHE_EXPIRATION,
      );
    } else {
      this.logger.warn(`No user found for user ID: ${userId}`);
    }

    return userData;
  }

  /**
   * Soft deletes a user from the system
   * @param userId - ID of the user to delete
   * @returns Confirmation message
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    this.logger.info(`Using service deleteUser for ID: ${userId}`);
    const supabase = this.supabaseService.getAdminClient();
    const redisClient = this.redisService.getRedisClient();

    await UserDatabaseHelper.softDeleteUser(supabase, userId);

    // Invalidate user caches
    await GlobalCacheHelper.invalidateCache(
      redisClient,
      USER_CACHE_KEYS.DETAIL(userId),
    );

    this.logger.info(`User soft deleted successfully: ${userId}`);
    return {
      message: 'User successfully soft deleted and removed from blocked table',
    };
  }

  /**
   * Checks if a user has blocked another user
   * @param userId - ID of the user checking the block status
   * @param targetUserId - ID of the user being checked
   * @returns Boolean indicating if the target user is blocked
   * @throws Error if block status check fails
   */
  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    this.logger.info(`Checking if user ${userId} has blocked ${targetUserId}`);
    try {
      const { data, error, status } = await this.supabaseService
        .getAdminClient()
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', userId)
        .eq('blocked_id', targetUserId)
        .single();

      if (error && status !== 406) {
        this.logger.error('Error fetching block status:', error);
        throw new Error('Error fetching block status');
      }

      const isBlocked = !!data;
      this.logger.info(
        `Block status for user ${userId} and target ${targetUserId}: ${isBlocked}`,
      );
      return isBlocked;
    } catch (error) {
      this.logger.error('Error in isUserBlocked:', error);
      throw new Error('Failed to check block status');
    }
  }

  /**
   * Toggles block status between two users
   * @param userId - ID of the user performing the block/unblock action
   * @param targetUserId - ID of the user being blocked/unblocked
   * @returns Boolean indicating if the user is now blocked (true) or unblocked (false)
   * @throws Error if block/unblock operation fails
   */
  async toggleBlockUser(
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    this.logger.info(
      `Toggling block status for user ${userId} and target ${targetUserId}`,
    );
    const redisClient = this.redisService.getRedisClient();

    try {
      const { data: user, error } = await this.supabaseService
        .getAdminClient()
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', userId)
        .eq('blocked_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error('Error checking block status:', error);
        throw new Error('Error checking block status');
      }

      if (user) {
        this.logger.info(
          `User ${targetUserId} is already blocked by ${userId}. Unblocking...`,
        );
        const { error: deleteError } = await this.supabaseService
          .getAdminClient()
          .from('blocked_users')
          .delete()
          .eq('blocker_id', userId)
          .eq('blocked_id', targetUserId);

        if (deleteError) {
          this.logger.error('Failed to unblock user:', deleteError);
          throw new Error('Failed to unblock user');
        }

        // Invalidate relevant caches
        await GlobalCacheHelper.invalidateCache(
          redisClient,
          USER_CACHE_KEYS.BLOCKS(userId),
        );
        this.logger.info(
          `User ${targetUserId} has been unblocked by ${userId}`,
        );
        return false;
      } else {
        this.logger.info(
          `User ${targetUserId} is not blocked by ${userId}. Blocking...`,
        );
        const { error: insertError } = await this.supabaseService
          .getAdminClient()
          .from('blocked_users')
          .insert([{ blocker_id: userId, blocked_id: targetUserId }]);

        if (insertError) {
          this.logger.error('Failed to block user:', insertError);
          throw new Error('Failed to block user');
        }

        // Invalidate relevant caches
        await GlobalCacheHelper.invalidateCache(
          redisClient,
          USER_CACHE_KEYS.BLOCKS(userId),
        );
        this.logger.info(`User ${targetUserId} has been blocked by ${userId}`);
        return true;
      }
    } catch (error) {
      this.logger.error('Error in toggleBlockUser:', error);
      throw error;
    }
  }

  /**
   * Retrieves user location information with cache support
   * @param userId - ID of the user whose location to retrieve
   * @returns User location information or null if not found
   */
  async getUserLocation(userId: string): Promise<UserLocationDto | null> {
    this.logger.info(`Using service getUserLocation for ID: ${userId}`);
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = USER_CACHE_KEYS.LOCATION(userId);

    const cachedLocation =
      await GlobalCacheHelper.getFromCache<UserLocationDto>(
        redisClient,
        cacheKey,
      );

    if (cachedLocation) {
      this.logger.info(`Cache hit for user location, ID: ${userId}`);
      return cachedLocation;
    }

    this.logger.info(
      `Cache miss for user location, ID: ${userId}, querying database`,
    );
    const supabase = this.supabaseService.getAdminClient();
    const locationData = await UserDatabaseHelper.getUserLocation(
      supabase,
      userId,
    );

    if (locationData) {
      this.logger.info(`Caching location data for user ID: ${userId}`);
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        locationData,
        this.CACHE_EXPIRATION,
      );
    } else {
      this.logger.warn(`No location found for user ID: ${userId}`);
    }

    return locationData;
  }

  /**
   * Updates the user's location using the provided data
   * @param userId - ID of the user whose location is being updated
   * @param address - Full address of the user
   * @param latitude - Latitude of the user's location
   * @param longitude - Longitude of the user's location
   * @returns Confirmation message
   * @throws Error if the update fails
   */
  async updateUserLocation(
    userId: string,
    address: string,
    latitude: number,
    longitude: number,
  ): Promise<{ message: string }> {
    this.logger.info(`Updating location for user ID: ${userId}`);
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.rpc('create_location_and_update_profile', {
      user_id: userId,
      address,
      latitude,
      longitude,
    });

    if (error) {
      this.logger.error(
        `Failed to update location for user ${userId}: ${error.message}`,
      );
      throw new Error('Failed to update location');
    }

    this.logger.info(`Location updated successfully for user ID: ${userId}`);
    return { message: 'Location updated successfully' };
  }
}
