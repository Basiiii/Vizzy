import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { UserCacheHelper } from './helpers/user-cache.helper';
import { UserDatabaseHelper } from './helpers/user-database.helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getUserIdByUsername(username: string): Promise<UserLookupDto | null> {
    this.logger.info(
      `Using service getUserIDByUsername for username: ${username}`,
    );
    const redisClient = this.redisService.getRedisClient();

    const cachedLookup = await UserCacheHelper.getUserLookupFromCache(
      redisClient,
      username,
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
      await UserCacheHelper.cacheLookup(redisClient, username, lookupData);
    } else {
      this.logger.warn(`No user found for username: ${username}`);
    }

    return lookupData;
  }

  async getUserById(userId: string): Promise<User | null> {
    this.logger.info(`Using service getUserById for ID: ${userId}`);
    const redisClient = this.redisService.getRedisClient();

    const cachedUser = await UserCacheHelper.getUserFromCache(
      redisClient,
      userId,
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
      await UserCacheHelper.cacheUser(redisClient, userId, userData);
    } else {
      this.logger.warn(`No user found for user ID: ${userId}`);
    }

    return userData;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    this.logger.info(`Using service deleteUser for ID: ${userId}`);
    const supabase = this.supabaseService.getAdminClient();
    await UserDatabaseHelper.softDeleteUser(supabase, userId);
    this.logger.info(`User soft deleted successfully: ${userId}`);
    return {
      message: 'User successfully soft deleted and removed from blocked table',
    };
  }
  
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
      this.logger.info(`Block status for user ${userId} and target ${targetUserId}: ${isBlocked}`);
      return isBlocked;
    } catch (error) {
      this.logger.error('Error in isUserBlocked:', error);
      throw new Error('Failed to check block status');
    }
  }

  async toggleBlockUser(userId: string, targetUserId: string): Promise<boolean> {
    this.logger.info(`Toggling block status for user ${userId} and target ${targetUserId}`);
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
        this.logger.info(`User ${targetUserId} is already blocked by ${userId}. Unblocking...`);
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
  
        this.logger.info(`User ${targetUserId} has been unblocked by ${userId}`);
        return false;
      } else {
        this.logger.info(`User ${targetUserId} is not blocked by ${userId}. Blocking...`);
        const { error: insertError } = await this.supabaseService
          .getAdminClient()
          .from('blocked_users')
          .insert([{ blocker_id: userId, blocked_id: targetUserId }]);
  
        if (insertError) {
          this.logger.error('Failed to block user:', insertError);
          throw new Error('Failed to block user');
        }
  
        this.logger.info(`User ${targetUserId} has been blocked by ${userId}`);
        return true;
      }
    } catch (error) {
      this.logger.error('Error in toggleBlockUser:', error);
      throw error;
    }
  }
}
