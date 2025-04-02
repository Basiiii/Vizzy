import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { ListingCacheHelper } from './helpers/listing-cache.helper';
import { ListingDatabaseHelper } from './helpers/listing-database.helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class ListingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getListingsByUserId(
    userId: string,
    options: ListingOptionsDto,
  ): Promise<Listing[]> {
    this.logger.info(
      `Using service getListingsByUserId for user ID: ${userId}`,
    );
    const redisClient = this.redisService.getRedisClient();

    const cachedListings = await ListingCacheHelper.getListingsFromCache(
      redisClient,
      userId,
    );
    if (cachedListings) {
      this.logger.info(`Cache hit for listings of user ID: ${userId}`);
      return cachedListings;
    }

    this.logger.info(
      `Cache miss for listings of user ID: ${userId}, querying database`,
    );
    const supabase = this.supabaseService.getPublicClient();
    const listings = await ListingDatabaseHelper.getListingsByUserId(
      supabase,
      userId,
      options,
    );

    if (listings.length > 0) {
      this.logger.info(`Caching listings for user ID: ${userId}`);
      await ListingCacheHelper.cacheListings(redisClient, userId, listings);
    } else {
      this.logger.warn(`No listings found for user ID: ${userId}`);
    }

    return listings;
  }
}
