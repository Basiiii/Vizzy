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
  async updateProfile(userId: string): Promise<User | null> {
    const supabase = this.supabaseService.getAdminClient();
  }
}
