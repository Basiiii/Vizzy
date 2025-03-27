import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { User } from './models/user.model';
import { RedisService } from '@/redis/redis.service';
import { UsernameLookupResult } from '@/dtos/username-lookup-result.dto';
import { CACHE_KEYS } from '@/constants/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getUserIdByUsername(username: string): Promise<UsernameLookupResult> {
    const cacheKey = CACHE_KEYS.USERNAME_LOOKUP(username);
    const redisClient = this.redisService.getRedisClient();

    // Try to get cached response from Redis
    try {
      const cachedLookup = await redisClient.get(cacheKey);

      if (cachedLookup) {
        console.log('Cache hit for user id from username lookup:', username);
        return JSON.parse(cachedLookup) as UsernameLookupResult;
      }
    } catch (error) {
      console.error(error);
    }

    // Fetch from database
    const supabase = this.supabaseService.getPublicClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .maybeSingle();

    // Error handling
    if (error) {
      console.error(`Error fetching user: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    if (!data) {
      console.log(`User not found: ${username}`);
      return null;
    }

    // Cache and return valid user
    console.log(`Cache miss for username: ${username}`);
    await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600);
    return { id: data.id, username: data.username };
  }

  async getUserById(userId: string): Promise<User | null> {
    const cacheKey = CACHE_KEYS.BASIC_USER_INFO(userId);
    const redisClient = this.redisService.getRedisClient();
    const cachedUser = await redisClient.get(cacheKey);

    // If cached data exists, return it
    if (cachedUser) {
      console.log('Cache hit for user:', userId);
      return JSON.parse(cachedUser) as User;
    }

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();

    const response = await supabase
      .from('profiles')
      .select('id, username, name, email, is_deleted, deleted_at')
      .eq('id', userId)
      .single();

    const { data, error } = response as { data: User | null; error: unknown };

    // Error handling
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    console.log('Cache miss');
    // Cache the user data in Redis with an expiration time of 1 hour
    await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600); // 3600 seconds = 1 hour

    return data;
  }

  async deleteUser(
    id: string,
  ): Promise<{ message: string } | { error: string }> {
    const supabase = this.supabaseService.getAdminClient();

    /*     const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.log('Erro na autenticação');
      console.log(authError);
      throw new HttpException(
        `Failed to delete user from auth: ${authError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
 */
    const { error: rpcError } = await supabase.rpc('soft_delete_user', {
      _user_id: id,
    });
    if (rpcError) {
      console.log('Erro no stored procedure.');
      console.log(rpcError);
      throw new HttpException(
        `Failed to exececute stored procedure: ${rpcError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    console.log('Correu bem');
    return {
      message: 'User successfully soft deleted and removed from blocked table',
    };
  }
}
