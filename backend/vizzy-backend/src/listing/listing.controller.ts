import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Version,
  Inject,
  ParseIntPipe,
  Post,
  UseGuards,
  Body,
  Req,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Patch,
  Headers,
  Delete,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing, UpdateImageUrlDto } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { API_VERSIONS } from '@/constants/api-versions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ListingPaginatedResponse } from '@/dtos/listing/listing-paginated-response.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ListingImagesResponseDto,
  UpdateListingImagesDto,
} from '@/dtos/listing/listing-images.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
} from '@nestjs/swagger';
import { RentalAvailabilityDto } from '@/dtos/listing/rental-availability.dto';
/**
 * Controller for managing listing operations
 */
@ApiTags('Listings')
@Controller('listings')
@ApiHeader({
  name: 'x-skip-cache',
  description: 'Set to "true" to bypass cache (for testing purposes)',
  required: false,
})
export class ListingController {
  constructor(
    private readonly listingService: ListingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Retrieves listings for a specific user
   * @param userId ID of the user whose listings to retrieve
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Array of basic listing information
   */
  @Get()
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get user listings',
    description: 'Retrieves listings for a specific user',
  })
  @ApiQuery({
    name: 'userid',
    description: 'ID of the user whose listings to retrieve',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Listings successfully retrieved',
    type: [ListingBasic],
  })
  @ApiResponse({
    status: 404,
    description: 'No listings found or user not found',
  })
  async getListings(
    @Headers('x-skip-cache') skipCache: string,
    @Query('userid') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<ListingBasic[]> {
    this.logger.info(`Using controller getListings for user ID: ${userId}`);
    if (!userId) {
      this.logger.warn('User ID is required but not provided');
      throw new NotFoundException('User ID is required');
    }

    const skipCacheFlag = skipCache === 'true';
    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    const listings = await this.listingService.getListingsByUserId(
      userId,
      options,
      skipCacheFlag,
    );

    if (!listings.length) {
      this.logger.warn(`No listings found for user ID: ${userId}`);
      throw new NotFoundException('No listings found for this user');
    }

    return listings;
  }

  /**
   * Retrieves listings for the home page with optional filtering
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @param listingType Type of listing to filter by
   * @param search Search term to filter listings
   * @param latitude Latitude for location-based search
   * @param longitude Longitude for location-based search
   * @param distance Distance in meters for location-based search
   * @returns Paginated listing response
   */
  @Get('home')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get home listings',
    description: 'Retrieves listings for the home page with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'type',
    description: 'Type of listing to filter by',
    required: false,
    enum: ['sale', 'rental', 'giveaway', 'swap'],
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term to filter listings',
    required: false,
  })
  @ApiQuery({
    name: 'lat',
    description: 'Latitude for location-based search',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'lon',
    description: 'Longitude for location-based search',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'dist',
    description: 'Distance in meters for location-based search',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Listings successfully retrieved',
    type: ListingPaginatedResponse,
  })
  @ApiResponse({ status: 404, description: 'No listings found' })
  async getHomeListings(
    @Headers('x-skip-cache') skipCache: string,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
    @Query('type') listingType?: string,
    @Query('search') search?: string,
    @Query('lat') latitude?: string,
    @Query('lon') longitude?: string,
    @Query('dist') distance?: string,
  ): Promise<ListingPaginatedResponse> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skipCacheFlag = skipCache === 'true';

    // Parse geolocation parameters if provided
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lon = longitude ? parseFloat(longitude) : undefined;
    const dist = distance ? parseFloat(distance) : undefined;

    this.logger.info(
      `Using controller getHomeListings with params: page=${page}, limit=${limit}, type=${listingType || 'null'}, search=${search || 'null'}, lat=${lat || 'null'}, lon=${lon || 'null'}, dist=${dist || 'null'}`,
    );

    const options = {
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber,
      listingType,
      search,
      page: pageNumber,
      latitude: lat,
      longitude: lon,
      distance: dist,
    };

    const result = await this.listingService.getHomeListings(
      options,
      skipCacheFlag,
    );

    if (!result.listings.length) {
      this.logger.warn('No home listings found with the provided criteria');
      throw new NotFoundException(
        'No listings found with the provided criteria',
      );
    }

    return {
      listings: result.listings,
      totalPages: result.totalPages,
      currentPage: pageNumber,
    };
  }

  /**
   * Retrieves all available product categories
   * @returns Array of category names
   */
  @Get('categories')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get product categories',
    description: 'Retrieves all available product categories for listings',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories successfully retrieved',
    type: [String],
  })
  @ApiResponse({ status: 404, description: 'No categories found' })
  async getProductCategories(): Promise<string[]> {
    this.logger.info('Using controller getProductCategories');
    const categories = await this.listingService.getProductCategories();
    if (!categories) {
      throw new NotFoundException('No categories found');
    }
    return categories;
  }

  /**
   * Retrieves a specific listing by its ID
   * @param id ID of the listing to retrieve
   * @returns The requested listing information
   */
  @Get(':id')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get listing by ID',
    description: 'Retrieves a specific listing by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the listing to retrieve',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Listing successfully retrieved',
    type: Listing,
  })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async getListingById(
    @Headers('x-skip-cache') skipCache = 'false',
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Listing> {
    this.logger.info(`Using controller getListingById for ID: ${id}`);
    const skipCacheFlag = skipCache === 'true';
    const listing = await this.listingService.getListingById(id, skipCacheFlag);

    if (!listing) {
      this.logger.warn(`Listing not found for ID: ${id}`);
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  /**
   * Creates a new listing for the authenticated user
   * @param req Request with authenticated user information
   * @param createListingDto Data for creating the listing
   * @returns The ID of the created listing
   */
  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new listing',
    description: 'Creates a new listing for the authenticated user',
  })
  @ApiBody({ type: CreateListingDto, description: 'Listing creation data' })
  @ApiResponse({
    status: 201,
    description: 'Listing successfully created',
    type: Number,
  })
  @ApiResponse({ status: 400, description: 'Invalid listing data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async createListing(
    @Req() req: RequestWithUser,
    @Body() createListingDto: CreateListingDto,
  ): Promise<number> {
    this.logger.info('Using controller createListing');
    const userId = req.user.sub;

    const result = await this.listingService.createListing(
      createListingDto,
      userId,
    );
    if (!result) {
      this.logger.error('Failed to create listing');
      throw new NotFoundException('Failed to create listing');
    }
    this.logger.info('Listing created successfully');
    return result;
  }

  /**
   * Retrieves images for a specific listing
   * @param listingId ID of the listing whose images to retrieve
   * @returns Array of listing images
   */
  @Get(':listingId/images')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get listing images',
    description: 'Retrieves images for a specific listing',
  })
  @ApiParam({
    name: 'listingId',
    description: 'ID of the listing whose images to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Images successfully retrieved',
    type: ListingImagesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async getListingImages(
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<ListingImagesResponseDto> {
    this.logger.info(
      'Using controller getListingImages for listing ID:',
      listingId,
    );

    return this.listingService.getListingImages(listingId);
  }

  /**
   * Updates the main image URL for a listing
   * @param req Request object containing user info
   * @param listingId ID of the listing to update
   * @param updateImageUrlDto DTO containing the new image URL
   */
  @Patch(':listingId/image-url')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update listing main image URL' })
  @ApiResponse({ status: 200, description: 'Image URL updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async updateListingImageUrl(
    @Req() req: RequestWithUser,
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() updateImageUrlDto: UpdateImageUrlDto,
  ) {
    this.logger.info(
      `Using controller updateListingImageUrl for listing ID: ${listingId}`,
    );
    // Verify the user owns the listing before allowing update
    await this.listingService.verifyListingAccess(listingId, req.user.sub);

    await this.listingService.updateListingImageUrl(
      listingId,
      updateImageUrlDto.imageUrl,
    );
    return { message: 'Listing image URL updated successfully' };
  }

  /**
   * Updates images for a listing by handling both additions and deletions
   * @param req Request object containing user info
   * @param files Array of new image files to upload
   * @param listingId ID of the listing
   * @param updateDto DTO containing image operations (deletions, main image)
   * @returns Updated list of listing images
   */
  @Post(':listingId/images')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'New image files to upload (max 10)',
        },
        imagesToDelete: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Array of image paths to delete',
        },
        mainImage: {
          type: 'string',
          description: 'Path of the image to set as main image',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update listing images' })
  @ApiResponse({
    status: 200,
    description: 'Images updated successfully',
    type: ListingImagesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or too many images',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @ApiBearerAuth()
  async updateListingImages(
    @Req() req: RequestWithUser,
    @UploadedFiles() files: Express.Multer.File[],
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() updateDto: UpdateListingImagesDto,
  ): Promise<ListingImagesResponseDto> {
    this.logger.info(
      `Using controller updateListingImages for listing ID: ${listingId}`,
    );
    await this.listingService.verifyListingAccess(listingId, req.user.sub);

    // Validate that there are either files to upload or images to delete
    if (
      (!files || files.length === 0) &&
      (!updateDto.imagesToDelete || updateDto.imagesToDelete.length === 0)
    ) {
      this.logger.warn(
        'No files provided for upload and no images marked for deletion',
      );
      throw new HttpException(
        'Must provide either files to upload or images to delete',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check total image count after additions and deletions
    const existingImageCount =
      await this.listingService.getListingImageCount(listingId);
    const deletionCount = updateDto.imagesToDelete?.length || 0;
    const additionCount = files?.length || 0;
    const finalImageCount = existingImageCount - deletionCount + additionCount;
    const maxTotalImages = 10;

    if (finalImageCount > maxTotalImages) {
      this.logger.warn(
        `Image count would exceed maximum: Current: ${existingImageCount}, Deleting: ${deletionCount}, Adding: ${additionCount}`,
      );
      throw new HttpException(
        `Total number of images cannot exceed ${maxTotalImages}. Current: ${existingImageCount}, Deleting: ${deletionCount}, Adding: ${additionCount}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.listingService.updateListingImages(listingId, files, updateDto);
  }

  /**
   * Updates an existing listing for the authenticated user
   * @param req Request with authenticated user information
   * @param listingId ID of the listing to update
   * @param createListingDto Data for updating the listing
   * @returns The updated listing information
   */
  @Patch(':listingId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update an existing listing',
    description: 'Updates an existing listing for the authenticated user',
  })
  @ApiParam({
    name: 'listingId',
    description: 'ID of the listing to update',
    type: Number,
  })
  @ApiBody({ type: CreateListingDto, description: 'Listing update data' })
  @ApiResponse({
    status: 200,
    description: 'Listing successfully updated',
    type: Listing,
  })
  @ApiResponse({ status: 400, description: 'Invalid listing data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @ApiBearerAuth()
  async updateListing(
    @Req() req: RequestWithUser,
    @Param('listingId', ParseIntPipe) listingId: number,
    @Body() createListingDto: CreateListingDto,
  ): Promise<Listing> {
    this.logger.info(
      `Using controller updateListing for listing ID: ${listingId}`,
    );
    const userId = req.user.sub;

    // Verify the user owns the listing before allowing update
    await this.listingService.verifyListingAccess(listingId, userId);
    console.log('Data on Controller:', createListingDto);
    const result = await this.listingService.updateListing(
      listingId,
      createListingDto,
    );
    if (!result) {
      this.logger.error('Failed to update listing');
      throw new NotFoundException('Failed to update listing');
    }
    this.logger.info('Listing updated successfully');
    return result;
  }

  /**
   * Soft deletes a listing (marks as deleted)
   * @param req Request with authenticated user information
   * @param listingId ID of the listing to delete
   * @returns Confirmation message
   */
  @Delete(':listingId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a listing' })
  @ApiResponse({
    status: 200,
    description: 'Listing soft deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @ApiBearerAuth()
  async softDeleteListing(
    @Req() req: RequestWithUser,
    @Param('listingId', ParseIntPipe) listingId: number,
  ) {
    this.logger.info(
      `Using controller softDeleteListing for listing ID: ${listingId}`,
    );
    const userId = req.user.sub;
    return await this.listingService.softDeleteListing(listingId, userId);
  }

  /**
   * Retrieves rental availability periods for a specific listing
   * @param id ID of the rental listing
   * @param skipCache Flag to bypass cache (for testing)
   * @returns Array of rental availability periods
   */
  @Get(':id/availability')
  @Version(API_VERSIONS.V1)
  @ApiOperation({
    summary: 'Get rental availability',
    description: 'Retrieves rental availability periods for a specific listing',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the rental listing',
    type: Number,
  })
  @ApiHeader({
    name: 'x-skip-cache',
    description: 'Set to "true" to bypass cache (for testing purposes)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Rental availability successfully retrieved',
    type: [RentalAvailabilityDto],
  })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async getRentalAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-skip-cache') skipCache: string,
  ): Promise<RentalAvailabilityDto[]> {
    this.logger.info(`Using controller getRentalAvailability for ID: ${id}`);
    const skipCacheFlag = skipCache === 'true';
    return this.listingService.getRentalAvailability(id, skipCacheFlag);
  }
}
