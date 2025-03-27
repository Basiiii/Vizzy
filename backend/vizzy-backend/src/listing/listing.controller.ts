import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from '@/dtos/listing/listing.dto';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  async getListings(
    @Query('userid') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<Listing[]> {
    if (!userId) {
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
      throw new NotFoundException('No listings found for this user');
    }

    return listings;
  }
}
