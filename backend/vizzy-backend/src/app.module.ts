import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase/supabase.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { RedisService } from './redis/redis.service';
import { AuthModule } from './auth/auth.module';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { ContactController } from './contact/contact.controller';
import { ListingController } from './listing/listing.controller';
import { ListingService } from './listing/listing.service';
import { ContactService } from './contact/contact.service';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './logging/logging.config';
import { EmailModule } from './email/email.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { ProposalController } from './proposal/proposal.controller';
import { ProposalService } from './proposal/proposal.service';
import { GeocodingService } from './geocoding/geocoding.service';
import { GeocodingController } from './geocoding/geocoding.controller';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { FavoritesController } from './favorites/favorites.controller';
import { FavoritesService } from './favorites/favorites.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonLoggerConfig),
    UserModule,
    AuthModule,
    EmailModule,
    PasswordResetModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
  ],
  controllers: [
    AppController,
    UserController,
    ProfileController,
    ListingController,
    ContactController,
    ProposalController,
    GeocodingController,
    FavoritesController,
  ],
  providers: [
    SupabaseService,
    RedisService,
    UserService,
    ProfileService,
    ListingService,
    ContactService,
    ProposalService,
    GeocodingService,
    FavoritesService,
    CustomThrottlerGuard,
  ],
})
export class AppModule {}
