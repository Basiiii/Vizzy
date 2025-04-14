import { Module } from '@nestjs/common';
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
import { TransactionController } from './transaction/transaction.controller';
import { TransactionService } from './transaction/transaction.service';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerConfig } from './logging/logging.config';
import { EmailModule } from './email/email.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { ProposalController } from './proposal/proposal.controller';
import { ProposalService } from './proposal/proposal.service';
import { GeocodingService } from './geocoding/geocoding.service';
import { GeocodingController } from './geocoding/geocoding.controller';
import { FavoriteController } from './favorite/favorite.controller';
import { FavoriteService } from './favorite/favorite.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRoot(winstonLoggerConfig),
    UserModule,
    AuthModule,
    EmailModule,
    PasswordResetModule,
  ],
  controllers: [
    AppController,
    UserController,
    ProfileController,
    ListingController,
    ContactController,
    TransactionController,
    ProposalController,
    GeocodingController,
    FavoriteController,
  ],
  providers: [
    SupabaseService,
    RedisService,
    UserService,
    ProfileService,
    ListingService,
    ContactService,
    TransactionService,
    ProposalService,
    GeocodingService,
    FavoriteService,
  ],
})
export class AppModule {}
