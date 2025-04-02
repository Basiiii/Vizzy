import { SupabaseClient } from '@supabase/supabase-js';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
export class ListingDatabaseHelper {
  private static logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    ListingDatabaseHelper.logger = logger;
  }
  static async getListingsByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: ListingOptionsDto,
  ): Promise<Listing[]> {
    ListingDatabaseHelper.logger.info(
      `Helper getListingsByUserId called for userId: ${userId}`,
    );
    const { data, error } = await supabase.rpc('fetch_listings', {
      _owner_id: userId,
      _limit: options.limit,
      _offset: options.offset,
    });

    if (error) {
      ListingDatabaseHelper.logger.error(
        `Error fetching listings for userId ${userId}: ${error.message}`,
      );
      throw new HttpException(
        `Failed to fetch user listings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return [];
    }

    ListingDatabaseHelper.logger.info(
      `Listings for userId ${userId} successfully found in database`,
    );
    return (data as Listing[]).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      price: item.price,
      priceperday: item.priceperday,
      image_url: item.image_url || this.getDefaultImageUrl(),
    }));
  }

  private static getDefaultImageUrl(): string {
    return 'https://images.unsplash.com/photo-1621122940876-2b3be129159c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  }
}
