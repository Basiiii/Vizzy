import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { User } from './models/user.model';
import { RedisService } from 'src/redis/redis.service';

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

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

  async uploadImage(
    fileBuffer: Buffer,
    mimetype: string,
    originalname: string,
  ) {
    if (!fileBuffer) throw new Error('Imagem obrigatória!');

    const filePath = `profiles/${Date.now()}-${originalname}`;
    const supabase = this.supabaseService.getPublicClient();

    const { data, error } = await supabase.storage
      .from('profile_pictures')
      .upload(filePath, fileBuffer, { contentType: mimetype });

    if (error) throw new Error(error.message);

    return {
      success: true,
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/profile_pictures/${filePath}`,
    };
  }
}
