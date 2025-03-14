import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [UserController],
  providers: [UserService, SupabaseService],
})
export class UserModule {}
