import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
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
  ): Promise<ListingBasic[]> {
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
    const supabase = this.supabaseService.getAdminClient();
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

  async getListingById(listingId: number): Promise<Listing | null> {
    this.logger.info(
      `Using service getListingById for listing ID: ${listingId}`,
    );
    const redisClient = this.redisService.getRedisClient();

    const cachedListing = await ListingCacheHelper.getListingFromCache(
      redisClient,
      listingId,
    );
    if (cachedListing) {
      this.logger.info(`Cache hit for listing ID: ${listingId}`);
      return cachedListing;
    }

    this.logger.info(
      `Cache miss for listing ID: ${listingId}, querying database`,
    );
    const supabase = this.supabaseService.getPublicClient();
    const listing = await ListingDatabaseHelper.getListingById(
      supabase,
      listingId,
    );

    if (listing) {
      this.logger.info(`Caching listing with ID: ${listingId}`);
      await ListingCacheHelper.cacheListing(redisClient, listingId, listing);
    } else {
      this.logger.warn(`No listing found with ID: ${listingId}`);
    }

    return listing;
  }

  async getHomeListings(options: {
    limit: number;
    offset: number;
    listingType?: string;
    search?: string;
  }): Promise<ListingBasic[]> {
    this.logger.info(
      `Using service getHomeListings with options: ${JSON.stringify(options)}`,
    );

    const supabase = this.supabaseService.getPublicClient();
    const listings = await ListingDatabaseHelper.getHomeListings(
      supabase,
      options,
    );

    if (listings.length === 0) {
      this.logger.warn('No home listings found with the provided criteria');
    } else {
      this.logger.info(`Found ${listings.length} home listings`);
    }

    return listings;
  }
}
