import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { User } from './models/user.model';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}:info`;
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
}
