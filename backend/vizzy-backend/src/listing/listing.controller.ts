import {
  Controller,
  Get,
  Query,
  NotFoundException,
  Version,
  Inject,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { API_VERSIONS } from '@/constants/api-versions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
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
  ): Promise<Listing[]> {
    this.logger.info(
      `Controller getListings() called with userId: ${userId}, page: ${page}, limit: ${limit}`,
    );
    if (!userId) {
      this.logger.error('User ID is required, throwing NotFoundException');
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
      this.logger.error(
        `No listings found for userId: ${userId}, throwing NotFoundException`,
      );
      throw new NotFoundException('No listings found for this user');
    }

    return listings;
  }
}
