import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { ListingCacheHelper } from './helpers/listing-cache.helper';
import { ListingDatabaseHelper } from './helpers/listing-database.helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { ListingImageHelper } from './helpers/listing-image.helper';
@Injectable()
export class ListingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getListingsByUserId(
    userId: string,
    options: { limit: number; offset: number },
  ): Promise<ListingBasic[]> {
    this.logger.info(
      `Using service getListingsByUserId for user ID: ${userId} with options: ${JSON.stringify(options)}`,
    );

    const page = Math.floor(options.offset / options.limit) + 1;
    const redisClient = this.redisService.getRedisClient();

    const cachedListings = await ListingCacheHelper.getUserListingsFromCache(
      redisClient,
      userId,
      page,
      options.limit,
    );

    if (cachedListings) {
      this.logger.info(
        `Cache hit for user listings with userId: ${userId}, page: ${page}, limit: ${options.limit}`,
      );
      return cachedListings;
    }

    this.logger.info(`Cache miss for user listings, querying database`);
    const supabase = this.supabaseService.getAdminClient();
    const listings = await ListingDatabaseHelper.getListingsByUserId(
      supabase,
      userId,
      options,
    );

    if (listings.length > 0) {
      // Cache the result
      await ListingCacheHelper.cacheUserListings(
        redisClient,
        userId,
        page,
        options.limit,
        listings,
      );
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
    const supabase = this.supabaseService.getAdminClient();
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
    page: number;
    latitude?: number;
    longitude?: number;
    distance?: number;
  }): Promise<{
    listings: ListingBasic[];
    totalPages: number;
    currentPage: number;
  }> {
    this.logger.info(
      `Using service getHomeListings with options: ${JSON.stringify(options)}`,
    );

    const redisClient = this.redisService.getRedisClient();

    // Try to get from cache first
    const cachedResult = await ListingCacheHelper.getHomeListingsFromCache(
      redisClient,
      options.page,
      options.limit,
      options.listingType,
      options.search,
      options.latitude,
      options.longitude,
      options.distance,
    );

    if (cachedResult) {
      this.logger.info(
        `Cache hit for home listings with options: ${JSON.stringify(options)}`,
      );
      return cachedResult;
    }

    this.logger.info(`Cache miss for home listings, querying database`);
    const supabase = this.supabaseService.getAdminClient();
    const { listings, totalPages } =
      await ListingDatabaseHelper.getHomeListings(supabase, options);

    if (listings.length === 0) {
      this.logger.warn('No home listings found with the provided criteria');
    } else {
      this.logger.info(
        `Found ${listings.length} home listings, total pages: ${totalPages}`,
      );

      // Cache the result
      const result = {
        listings,
        totalPages,
        currentPage: options.page,
      };

      await ListingCacheHelper.cacheHomeListings(
        redisClient,
        options.page,
        options.limit,
        options.listingType,
        options.search,
        options.latitude,
        options.longitude,
        options.distance,
        result,
      );
    }

    return {
      listings,
      totalPages,
      currentPage: options.page,
    };
  }

  async createListing(
    createListingDto: CreateListingDto,
    userId: string,
  ): Promise<number> {
    this.logger.info('Using service createListing');
    console.log('data on service: ', createListingDto);
    const supabase = this.supabaseService.getAdminClient();
    const result = await ListingDatabaseHelper.createListing(
      supabase,
      createListingDto,
      userId,
    );
    if (!result) {
      this.logger.error('Failed to create listing');
      throw new Error('Failed to create listing');
    }
    this.logger.info('Listing created successfully');
    return result;
  }

  async verifyListingAccess(listingId: number, userId: string): Promise<void> {
    this.logger.info(
      `Verifying access to listing ID: ${listingId} for user: ${userId}`,
    );

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('full_product_listings')
      .select('owner_id')
      .eq('id', listingId);

    if (error) {
      this.logger.error(`Error verifying listing access: ${error.message}`);
      throw new HttpException(
        'Failed to verify proposal access',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Check if we got any results
    if (!data || data.length === 0) {
      this.logger.warn(`Listing not found: ${listingId}`);
      throw new HttpException('Listing not found', HttpStatus.NOT_FOUND);
    }

    // Check if the user has access to any of the returned proposals
    const hasAccess = data.some((listing) => listing.owner_id === userId);

    if (!hasAccess) {
      this.logger.warn(
        `User ${userId} does not have access to listing ${listingId}`,
      );
      throw new HttpException(
        'You do not have permission to access this listing',
        HttpStatus.FORBIDDEN,
      );
    }

    this.logger.info(`Access verified for listing ID: ${listingId}`);
  }

  async processAndUploadListingImages(
    files: Express.Multer.File[],
    listingId: number,
  ): Promise<{ images: { path: string; url: string }[] }> {
    this.logger.info(
      `Processing and uploading ${files.length} images for listing ID: ${listingId}`,
    );

    const supabase = this.supabaseService.getAdminClient();
    const results = [];

    for (const file of files) {
      try {
        ListingImageHelper.validateImageType(file.mimetype, this.logger);

        const processedImage = await ListingImageHelper.processImage(
          file.buffer,
          this.logger,
        );

        const result = await ListingImageHelper.uploadImage(
          supabase,
          listingId,
          processedImage,
          file.originalname,
          this.logger,
        );

        results.push(result.data);
      } catch (error) {
        this.logger.error(`Error processing image: ${error.message}`);
      }
    }

    if (results.length === 0) {
      throw new HttpException(
        'Failed to upload any images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { images: results };
  }
  async getListingImageCount(listingId: number): Promise<number> {
    this.logger.info(`Getting image count for listing ID: ${listingId}`);

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.storage
      .from('listings')
      .list(`${listingId}`);

    if (error) {
      this.logger.error(`Error getting listing images: ${error.message}`);
      if (error.message.includes('not found')) {
        return 0;
      }
      throw new HttpException(
        'Failed to get listing images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data ? data.length : 0;
  }

  async getListingImages(
    listingId: number,
  ): Promise<{ images: { path: string; url: string }[] }> {
    this.logger.info(`Getting listing images for proposal ID: ${listingId}`);

    const redisClient = this.redisService.getRedisClient();
    const cacheKey = CACHE_KEYS.LISTING_IMAGES(listingId);

    const cachedImages = await ListingCacheHelper.getFromCache<{
      images: { path: string; url: string }[];
    }>(redisClient, cacheKey);

    if (cachedImages) {
      this.logger.info(
        `Retrieved listing images from cache for ID: ${listingId}`,
      );
      return cachedImages;
    }

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.storage
      .from('listings')
      .list(`${listingId}`);

    if (error) {
      this.logger.error(`Error getting listing images: ${error.message}`);
      if (error.message.includes('not found')) {
        return { images: [] };
      }
      throw new HttpException(
        'Failed to get listing images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data || data.length === 0) {
      this.logger.info(`No images found for listing ID: ${listingId}`);
      return { images: [] };
    }

    const images = data.map((file) => ({
      path: `${listingId}/${file.name}`,
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/listings/${listingId}/${file.name}`,
    }));

    const response = { images };
    this.logger.info(
      `Found ${images.length} images for listing ID: ${listingId}`,
    );

    this.logger.info(
      `Caching ${images.length} images for listing ID: ${listingId}`,
    );

    await ListingCacheHelper.setCache<{
      images: { path: string; url: string }[];
    }>(
      redisClient,
      cacheKey,
      response,
      3600, // Cache for 1 hour
    );

    return response;
  }
}
