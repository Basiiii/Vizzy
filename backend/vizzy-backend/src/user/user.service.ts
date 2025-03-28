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
      .select(
        'id, username, name, email, phone_number!inner(contacts), city!inner(locations), country!inner(location), is_deleted, deleted_at',
      )
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

  async toggleBlockUser(userId: string, targetUserId: string): Promise<boolean> {
    console.log(`Toggling block status for user ${userId} and target ${targetUserId}`);
    try {
      // Verifica se o registro já existe
      const { data: user, error } = await this.supabaseService
        .getAdminClient()
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', userId)
        .eq('blocked_id', targetUserId)
        .single();
  
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking block status:', error);
        throw new Error('Error checking block status');
      }
  
      if (user) {
        // Desbloqueia o usuário
        console.log(`User ${targetUserId} is already blocked by ${userId}. Unblocking...`);
        const { error: deleteError } = await this.supabaseService
          .getAdminClient()
          .from('blocked_users')
          .delete()
          .eq('blocker_id', userId)
          .eq('blocked_id', targetUserId);
  
        if (deleteError) {
          console.error('Failed to unblock user:', deleteError);
          throw new Error('Failed to unblock user');
        }
  
        console.log(`User ${targetUserId} has been unblocked by ${userId}`);
        return false; // Usuário foi desbloqueado
      } else {
        // Bloqueia o usuário
        console.log(`User ${targetUserId} is not blocked by ${userId}. Blocking...`);
        const { error: insertError } = await this.supabaseService
          .getAdminClient()
          .from('blocked_users')
          .insert([{ blocker_id: userId, blocked_id: targetUserId }]);
  
        if (insertError) {
          console.error('Failed to block user:', insertError);
          throw new Error('Failed to block user');
        }
  
        console.log(`User ${targetUserId} has been blocked by ${userId}`);
        return true; // Usuário foi bloqueado
      }
    } catch (error) {
      console.error('Error in toggleBlockUser:', error);
      throw error;
    }
  }

  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    console.log(`Checking if user ${userId} has blocked ${targetUserId}`);
    try {
      const { data, error, status } = await this.supabaseService
        .getAdminClient()
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', userId)
        .eq('blocked_id', targetUserId)
        .single();
  
      if (error && status !== 406) {
        console.error('Error fetching block status:', error);
        throw new Error('Error fetching block status');
      }
  
      const isBlocked = !!data;
      console.log(`Block status for user ${userId} and target ${targetUserId}: ${isBlocked}`);
      return isBlocked;
    } catch (error) {
      console.error('Error in isUserBlocked:', error);
      throw new Error('Failed to check block status');
    }
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
