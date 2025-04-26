import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { ListingDatabaseHelper } from './helpers/listing-database.helper';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';
import { LISTING_CACHE_KEYS } from '@/constants/cache/listing.cache-keys';
import { ListingImageHelper } from './helpers/listing-image.helper';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';

/**
 * Service responsible for managing listing operations
 * Handles CRUD operations for listings with caching support
 */
@Injectable()
export class ListingService {
  private readonly CACHE_EXPIRATION = 3600; // 1 hour
  private readonly HOME_LISTINGS_CACHE_EXPIRATION = 900; // 15 minutes

  /**
   * Creates an instance of ListingService
   * @param supabaseService - Service for Supabase database operations
   * @param redisService - Service for Redis caching operations
   * @param logger - Winston logger instance
   */
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Retrieves listings for a specific user with pagination
   * Attempts to fetch from cache first, falls back to database if cache miss
   * @param userId - ID of the user whose listings to retrieve
   * @param options - Pagination options including limit and offset
   * @param skipCache - Flag to bypass cache (for testing)
   * @returns Array of basic listing information
   */
  async getListingsByUserId(
    userId: string,
    options: { limit: number; offset: number },
    skipCache = false,
  ): Promise<ListingBasic[]> {
    this.logger.info(
      `Using service getListingsByUserId for user ID: ${userId} with options: ${JSON.stringify(options)}`,
    );

    const page = Math.floor(options.offset / options.limit) + 1;
    const redisClient = this.redisService.getRedisClient();
    const cacheKey = LISTING_CACHE_KEYS.PAGINATED_BY_USER(
      userId,
      page,
      options.limit,
    );

    if (!skipCache) {
      const cachedListings = await GlobalCacheHelper.getFromCache<
        ListingBasic[]
      >(redisClient, cacheKey);

      if (cachedListings) {
        this.logger.info(
          `Cache hit for user listings with userId: ${userId}, page: ${page}, limit: ${options.limit}`,
        );
        return cachedListings;
      }
    } else {
      this.logger.info(
        `Skipping cache for user listings with userId: ${userId} (skipCache flag set)`,
      );
    }

    this.logger.info(`Cache miss for user listings, querying database`);
    const supabase = this.supabaseService.getAdminClient();
    const listings = await ListingDatabaseHelper.getListingsByUserId(
      supabase,
      userId,
      options,
    );

    if (listings.length > 0 && !skipCache) {
      this.logger.info(
        `Caching ${listings.length} listings for user ID: ${userId}, page: ${page}`,
      );
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        listings,
        this.CACHE_EXPIRATION,
      );
    }

    return listings;
  }

  /**
   * Retrieves a specific listing by its ID
   * Attempts to fetch from cache first, falls back to database if cache miss
   * @param listingId - ID of the listing to retrieve
   * @param skipCache - Flag to bypass cache (for testing)
   * @returns The requested listing information or null if not found
   */
  async getListingById(
    listingId: number,
    skipCache = false,
  ): Promise<Listing | null> {
    this.logger.info(
      `Using service getListingById for listing ID: ${listingId}`,
    );

    const redisClient = this.redisService.getRedisClient();
    const cacheKey = LISTING_CACHE_KEYS.DETAIL(listingId);

    if (!skipCache) {
      const cachedListing = await GlobalCacheHelper.getFromCache<Listing>(
        redisClient,
        cacheKey,
      );

      if (cachedListing) {
        this.logger.info(`Cache hit for listing ID: ${listingId}`);
        return cachedListing;
      }
    } else {
      this.logger.info(
        `Skipping cache for listing ID: ${listingId} (skipCache flag set)`,
      );
    }

    this.logger.info(
      `Cache miss for listing ID: ${listingId}, querying database`,
    );
    const supabase = this.supabaseService.getAdminClient();
    const listing = await ListingDatabaseHelper.getListingById(
      supabase,
      listingId,
    );

    if (listing && !skipCache) {
      this.logger.info(`Caching listing data for ID: ${listingId}`);
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        listing,
        this.CACHE_EXPIRATION,
      );
    }

    return listing;
  }

  /**
   * Retrieves listings for the home page with optional filtering and pagination
   * Attempts to fetch from cache first, falls back to database if cache miss
   * @param options - Options for filtering and pagination
   * @param skipCache - Flag to bypass cache (for testing)
   * @returns Object containing listings, total pages, and current page
   */
  async getHomeListings(
    options: {
      limit: number;
      offset: number;
      listingType?: string;
      search?: string;
      page: number;
      latitude?: number;
      longitude?: number;
      distance?: number;
    },
    skipCache = false,
  ): Promise<{
    listings: ListingBasic[];
    totalPages: number;
    currentPage: number;
  }> {
    this.logger.info(
      `Using service getHomeListings with options: ${JSON.stringify(options)}`,
    );

    const redisClient = this.redisService.getRedisClient();
    const cacheKey = LISTING_CACHE_KEYS.HOME(
      options.page,
      options.limit,
      options.listingType,
      options.search,
      options.latitude,
      options.longitude,
      options.distance,
    );

    if (!skipCache) {
      const cachedResult = await GlobalCacheHelper.getFromCache<{
        listings: ListingBasic[];
        totalPages: number;
        currentPage: number;
      }>(redisClient, cacheKey);

      if (cachedResult) {
        this.logger.info(
          `Cache hit for home listings with options: ${JSON.stringify(options)}`,
        );
        return cachedResult;
      }
    } else {
      this.logger.info(`Skipping cache for home listings (skipCache flag set)`);
    }

    this.logger.info(`Cache miss for home listings, querying database`);
    const supabase = this.supabaseService.getAdminClient();
    const { listings, totalPages } =
      await ListingDatabaseHelper.getHomeListings(supabase, options);

    const result = {
      listings,
      totalPages,
      currentPage: options.page,
    };

    if (listings.length > 0 && !skipCache) {
      this.logger.info(
        `Caching ${listings.length} home listings, total pages: ${totalPages}, current page: ${options.page}`,
      );
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        result,
        this.HOME_LISTINGS_CACHE_EXPIRATION,
      );
    }

    return result;
  }

  /**
   * Creates a new listing for a user
   * @param createListingDto - Data for creating the listing
   * @param userId - ID of the user creating the listing
   * @returns The ID of the newly created listing
   * @throws Error if listing creation fails
   */
  async createListing(
    createListingDto: CreateListingDto,
    userId: string,
  ): Promise<number> {
    this.logger.info('Using service createListing');
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

  /**
   * Verifies if a user has access to a specific listing
   * @param listingId - ID of the listing to check access for
   * @param userId - ID of the user requesting access
   * @throws HttpException if access is denied or listing not found
   */
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

  /**
   * Processes and uploads images for a listing
   * @param files - Array of files to process and upload
   * @param listingId - ID of the listing to attach images to
   * @returns Object containing information about the uploaded images
   * @throws HttpException if image processing or upload fails
   */
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

  /**
   * Gets the count of images for a specific listing
   * @param listingId - ID of the listing to get image count for
   * @returns The number of images associated with the listing
   * @throws HttpException if there's an error retrieving the image count
   */
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

  /**
   * Retrieves all images for a specific listing
   * Attempts to fetch from cache first, falls back to database if cache miss
   * @param listingId - ID of the listing to get images for
   * @returns Object containing array of image information
   * @throws HttpException if there's an error retrieving the images
   */
  async getListingImages(
    listingId: number,
  ): Promise<{ images: { path: string; url: string }[] }> {
    this.logger.info(`Getting listing images for listing ID: ${listingId}`);

    const redisClient = this.redisService.getRedisClient();
    const cacheKey = LISTING_CACHE_KEYS.IMAGES(listingId);

    const cachedImages = await GlobalCacheHelper.getFromCache<{
      images: { path: string; url: string }[];
    }>(redisClient, cacheKey);

    if (cachedImages) {
      this.logger.info(`Cache hit for listing images, ID: ${listingId}`);
      return cachedImages;
    }

    this.logger.info(
      `Cache miss for listing images, ID: ${listingId}, fetching from storage`,
    );
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

    if (images.length > 0) {
      this.logger.info(
        `Caching ${images.length} images for listing ID: ${listingId}`,
      );
      await GlobalCacheHelper.setCache(
        redisClient,
        cacheKey,
        response,
        this.CACHE_EXPIRATION,
      );
    }

    return response;
  }

  /**
   * Updates the main image URL for a listing
   * @param listingId - ID of the listing
   * @param imageUrl - The new image URL
   */
  async updateListingImageUrl(
    listingId: number,
    imageUrl: string,
  ): Promise<void> {
    this.logger.info(
      `Using service updateListingImageUrl for listing ID: ${listingId}`,
    );
    const supabase = this.supabaseService.getAdminClient();
    await ListingDatabaseHelper.updateListingImageUrl(
      supabase,
      listingId,
      imageUrl,
    );
  }

  /**
   * Retrieves all available product categories from the database
   * Fetches the list of categories that can be used for listings
   * @returns Promise containing an array of category names as strings
   * @throws HttpException if categories cannot be retrieved
   */
  async getProductCategories(): Promise<string[]> {
    this.logger.info('Using getProductCategories service');
    const supabase = this.supabaseService.getAdminClient();
    const categories =
      await ListingDatabaseHelper.getProductCategories(supabase);

    if (!categories) {
      this.logger.error('Error getting product categories');
      throw new HttpException(
        'Failed to get product categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    this.logger.info('Retrieved product categories');
    return categories;
  }
}
