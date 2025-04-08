import { SupabaseClient } from '@supabase/supabase-js';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class ListingDatabaseHelper {
  static async getListingsByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: ListingOptionsDto,
  ): Promise<ListingBasic[]> {
    const { data, error } = await supabase.rpc('fetch_listings', {
      _owner_id: userId,
      _limit: options.limit,
      _offset: options.offset,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch user listings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return [];
    }

    return (data as any[]).map((item) => ({
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

  static async getListingById(
    supabase: SupabaseClient,
    listingId: number,
  ): Promise<Listing | null> {
    const { data, error } = await supabase.rpc('get_listing_json', {
      listing_id: listingId,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch listing: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data as Listing;
  }

  static async getHomeListings(
    supabase: SupabaseClient,
    options: {
      limit: number;
      offset: number;
      listingType?: string;
      search?: string;
    },
  ): Promise<ListingBasic[]> {
    const { data, error } = await supabase.rpc('fetch_home_listings', {
      _limit: options.limit,
      _offset: options.offset,
      _listing_type: options.listingType || null,
      _search: options.search || null,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch home listings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return [];
    }

    return (data as any[]).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      price: item.price,
      priceperday: item.priceperday,
      image_url: item.imageurl || this.getDefaultImageUrl(),
    }));
  }
}
