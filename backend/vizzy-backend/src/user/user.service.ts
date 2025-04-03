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
}
