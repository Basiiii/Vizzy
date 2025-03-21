import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { User } from './models/user.model';
import { RedisService } from '@/redis/redis.service';
import { CACHE_KEYS } from '@/constants/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

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

  async getMe(userId: string): Promise<User | null> {
    const cacheKey = CACHE_KEYS.USER_ACCOUNT_INFO(userId);
    const redisClient = this.redisService.getRedisClient();
    //const cachedUser = await redisClient.get(cacheKey);

    console.error();
    // If cached data exists, return it
    /* if (cachedUser) {
      console.log('Cache hit for user:', userId);
      const teste = cachedUser;
      console.log(teste);
      return JSON.parse(cachedUser) as User;
    } */

    // If no cache, fetch from the database
    const supabase = this.supabaseService.getPublicClient();

    console.log(userId);

    const response = await supabase
      .from('profiles')
      .select(
        `
      id, username, email, name, 
      contacts!inner(phone_number, description)
    `,
      )
      .eq('contacts.user_id', userId)
      .eq('id', userId);
    //.single();

    /*   const contactsResponse = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId);
    console.log(contactsResponse); */

    const { data, error } = response as { data: User | null; error: unknown };
    console.log(data);

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    console.log('Cache miss');
    // Cache the user data in Redis with an expiration time of 1 hour
    //await redisClient.set(cacheKey, JSON.stringify(data), 'EX', 3600); // 3600 seconds = 1 hour

    return data;
  }

  /*async deleteUser(
   // token: string,
  ): Promise<{ message: string } | { error: string }> {
    const jwtSecret = `JWT_SECRET`;

    const supabase = this.supabaseService.getPublicClient();

    const {
      data: { user },
    } = await supabase.auth.getUser(jwtSecret);

    //const id: string = user?.id;
    //const { data, error } = await supabase.auth.admin.deleteUser(id);
    //return { message: 'User deleted successfully' };
  }*/
}
