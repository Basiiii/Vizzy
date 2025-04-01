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
      `Service getUserIdByUsername() called with username: ${username}`,
    );
    const redisClient = this.redisService.getRedisClient();

    const cachedLookup = await UserCacheHelper.getUserLookupFromCache(
      redisClient,
      username,
    );
    if (cachedLookup) {
      this.logger.info(
        `Cache hit in service getUserIdByUsername() for username: ${username}`,
      );
      return cachedLookup;
    }

    const supabase = this.supabaseService.getPublicClient();
    const lookupData = await UserDatabaseHelper.getUserByUsername(
      supabase,
      username,
    );

    if (lookupData) {
      this.logger.info(
        `Database hit for username: ${username}, caching result...`,
      );
      await UserCacheHelper.cacheLookup(redisClient, username, lookupData);
    } else {
      this.logger.warn(`User not found in database for username: ${username}`);
    }

    return lookupData;
  }

  async getUserById(userId: string): Promise<User | null> {
    this.logger.info(`Service getUserIdById() called with id: ${userId}`);

    const redisClient = this.redisService.getRedisClient();

    const cachedUser = await UserCacheHelper.getUserFromCache(
      redisClient,
      userId,
    );
    if (cachedUser) {
      this.logger.info(
        `Cache hit in service getUserIdById() for id: ${userId}`,
      );
      return cachedUser;
    }
    const supabase = this.supabaseService.getPublicClient();
    const userData = await UserDatabaseHelper.getUserById(supabase, userId);

    if (userData) {
      this.logger.info(`Database hit for userId: ${userId}, caching result...`);
      await UserCacheHelper.cacheUser(redisClient, userId, userData);
    } else {
      this.logger.warn(`User not found in database for userId: ${userId}`);
    }

    return userData;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    this.logger.info(`Service deleteUser() called for userId: ${userId}`);

    const supabase = this.supabaseService.getAdminClient();
    await UserDatabaseHelper.softDeleteUser(supabase, userId);
    return {
      message: 'User successfully soft deleted and removed from blocked table',
    };
  }
}
