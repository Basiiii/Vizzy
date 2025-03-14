import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [UserController],
  providers: [UserService, SupabaseService, RedisService],
})
export class UserModule {}
