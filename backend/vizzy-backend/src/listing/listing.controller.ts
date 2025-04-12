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
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { API_VERSIONS } from '@/constants/api-versions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ListingPaginatedResponse } from '@/dtos/listing/listing-paginated-response.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ListingImagesResponseDto } from '@/dtos/listing/listing-images.dto';
@Controller('listings')
export class ListingController {
  constructor(
    private readonly listingService: ListingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get()
  @Version(API_VERSIONS.V1)
  async getListings(
    @Query('userid') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<ListingBasic[]> {
    this.logger.info(`Using controller getListings for user ID: ${userId}`);
    if (!userId) {
      this.logger.warn('User ID is required but not provided');
      throw new NotFoundException('User ID is required');
    }

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    const listings = await this.listingService.getListingsByUserId(
      userId,
      options,
    );

    if (!listings.length) {
      this.logger.warn(`No listings found for user ID: ${userId}`);
      throw new NotFoundException('No listings found for this user');
    }

    return listings;
  }

  @Get('home')
  @Version(API_VERSIONS.V1)
  async getHomeListings(
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

    const result = await this.listingService.getHomeListings(options);

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

  @Get(':id')
  @Version(API_VERSIONS.V1)
  async getListingById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Listing> {
    this.logger.info(`Using controller getListingById for listing ID: ${id}`);

    const listing = await this.listingService.getListingById(id);

    if (!listing) {
      this.logger.warn(`No listing found with ID: ${id}`);
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    return listing;
  }

  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
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

  @Get(':listingId/images')
  @Version(API_VERSIONS.V1)
  async getListingImages(
    @Param('listingId', ParseIntPipe) listingId: number,
  ): Promise<ListingImagesResponseDto> {
    this.logger.info(
      'Using controller getListingImages for listing ID:',
      listingId,
    );

    return this.listingService.getListingImages(listingId);
  }

  @Post(':listingId/images')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 1 * 1024 * 1024 }, // 1MB per file
    }),
  )
  async uploadListingImages(
    @Req() req: RequestWithUser,
    @UploadedFiles() files: Express.Multer.File[],
    @Param('listingId', ParseIntPipe) listingId: number,
  ) {
    if (!files || files.length === 0) {
      this.logger.warn('No files provided for listing images upload');
      throw new NotFoundException('No files provided');
    }
    await this.listingService.verifyListingAccess(listingId, req.user.sub);

    const existingImageCount =
      await this.listingService.getListingImageCount(listingId);
    const maxTotalImages = 10;
    const remainingSlots = maxTotalImages - existingImageCount;

    if (remainingSlots <= 0) {
      throw new HttpException(
        'Maximum number of images (10) already reached for this proposal',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (files.length > remainingSlots) {
      this.logger.warn(
        `User attempted to upload ${files.length} images but only ${remainingSlots} slots remaining`,
      );
      throw new HttpException(
        `You can only upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} for this listing`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.listingService.processAndUploadListingImages(files, listingId);
  }
}
