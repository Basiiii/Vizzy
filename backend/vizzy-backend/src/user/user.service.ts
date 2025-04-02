import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { User } from '@/dtos/user/user.dto';
import { UserLookupDto } from '@/dtos/user/user-lookup.dto';
import { UserCacheHelper } from './helpers/user-cache.helper';
import { UserDatabaseHelper } from './helpers/user-database.helper';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getUserIdByUsername(username: string): Promise<UserLookupDto | null> {
    const redisClient = this.redisService.getRedisClient();

    const cachedLookup = await UserCacheHelper.getUserLookupFromCache(
      redisClient,
      username,
    );
    if (cachedLookup) return cachedLookup;

    const supabase = this.supabaseService.getPublicClient();
    const lookupData = await UserDatabaseHelper.getUserByUsername(
      supabase,
      username,
    );

    if (lookupData) {
      await UserCacheHelper.cacheLookup(redisClient, username, lookupData);
    }

    return lookupData;
  }

  async getUserById(userId: string): Promise<User | null> {
    const redisClient = this.redisService.getRedisClient();

    const cachedUser = await UserCacheHelper.getUserFromCache(
      redisClient,
      userId,
    );
    if (cachedUser) return cachedUser;

    const supabase = this.supabaseService.getPublicClient();
    const userData = await UserDatabaseHelper.getUserById(supabase, userId);

    if (userData) {
      await UserCacheHelper.cacheUser(redisClient, userId, userData);
    }

    return userData;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const supabase = this.supabaseService.getAdminClient();
    await UserDatabaseHelper.softDeleteUser(supabase, userId);
    return {
      message: 'User successfully soft deleted and removed from blocked table',
    };
  }
}
