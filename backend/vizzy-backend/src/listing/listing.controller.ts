import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Version,
  Inject,
  ParseIntPipe,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { API_VERSIONS } from '@/constants/api-versions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ListingPaginatedResponse } from '@/dtos/listing/listing-paginated-response.dto';

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
}
