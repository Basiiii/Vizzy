import { SupabaseClient } from '@supabase/supabase-js';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateListingDto } from '@/dtos/listing/create-listing.dto';

/**
 * Helper class for database operations related to listings
 * Provides methods for CRUD operations on listing data in Supabase
 */
export class ListingDatabaseHelper {
  /**
   * Retrieves listings for a specific user with pagination
   * @param supabase - Supabase client instance
   * @param userId - ID of the user whose listings to retrieve
   * @param options - Pagination options including limit and offset
   * @returns Array of basic listing information
   * @throws HttpException if fetching fails
   */
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

  /**
   * Provides a default image URL when a listing has no image
   * @returns URL to a default placeholder image
   */
  private static getDefaultImageUrl(): string {
    return 'https://images.unsplash.com/photo-1621122940876-2b3be129159c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  }

  /**
   * Retrieves a specific listing by its ID
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing to retrieve
   * @returns The requested listing information or null if not found
   * @throws HttpException if fetching fails
   */
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

  /**
   * Retrieves listings for the home page with optional filtering and pagination
   * @param supabase - Supabase client instance
   * @param options - Options for filtering and pagination
   * @returns Object containing listings and total pages
   * @throws HttpException if fetching fails
   */
  static async getHomeListings(
    supabase: SupabaseClient,
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
  ): Promise<{ listings: ListingBasic[]; totalPages: number }> {
    const { data, error } = await supabase.rpc('fetch_home_listings', {
      _limit: options.limit,
      _offset: options.offset,
      _listing_type: options.listingType || null,
      _search: options.search || null,
      _lat: options.latitude || null,
      _lon: options.longitude || null,
      _dist: options.distance || null,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch home listings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data || !data.length) {
      return { listings: [], totalPages: 0 };
    }

    // Extract total_pages from the first row
    const totalPages = data[0].total_pages || 1;

    const listings = (data as any[]).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      price: item.price,
      priceperday: item.priceperday,
      image_url: item.imageurl || this.getDefaultImageUrl(),
    }));

    return { listings, totalPages };
  }

  /**
   * Creates a new listing in the database
   * @param supabase - Supabase client instance
   * @param dto - Data for creating the listing
   * @param userId - ID of the user creating the listing
   * @returns The ID of the newly created listing
   * @throws HttpException if creation fails
   */
  static async createListing(
    supabase: SupabaseClient,
    dto: CreateListingDto,
    userId: string,
  ): Promise<number> {
    console.log('data on DB helper:', dto);
    const { data, error } = await supabase.rpc('create_listing', {
      p_title: dto.title,
      p_description: dto.description,
      p_category: dto.category,
      p_listing_status: 'active',
      p_listing_type: dto.listing_type,
      p_user_id: userId,
      p_product_condition: dto.product_condition,
      p_price: dto.price,
      p_is_negotiable: dto.is_negotiable,
      p_deposit_required: dto.deposit_required,
      p_cost_per_day: dto.cost_per_day,
      p_auto_close_date: dto.auto_close_date,
      p_rental_duration_limit: dto.rental_duration_limit,
      p_late_fee: dto.late_fee,
      p_desired_item: dto.desired_item,
      p_recipient_requirements: dto.recipient_requirements,
    });
    if (!data) {
      throw new HttpException(
        `Failed to create listing: No data returned`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (error) {
      throw new HttpException(
        `Failed to create listing: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data as number;
  }
}
