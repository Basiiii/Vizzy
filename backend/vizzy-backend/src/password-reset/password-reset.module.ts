import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { SupabaseService } from '../supabase/supabase.service';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';

@Module({
  imports: [ConfigModule, EmailModule],
  providers: [PasswordResetService, SupabaseService],
  controllers: [PasswordResetController],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
