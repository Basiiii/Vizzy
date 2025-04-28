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
    const { data, error } = await supabase.rpc('fetch_user_listings', {
      owner_id: userId,
      fetch_limit: options.limit,
      fetch_offset: options.offset,
    });
    console.log('data retrieved from DB on DB helper:', data);

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
      image_url: item.main_image_url || this.getDefaultImageUrl(),
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
    console.log('data received on DB helper:', data);
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
      fetch_limit: options.limit,
      fetch_offset: options.offset,
      listing_type: options.listingType || null,
      search: options.search || null,
      lat: options.latitude || null,
      lon: options.longitude || null,
      dist: options.distance || null,
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
      priceperday: item.cost_per_day,
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
      title: dto.title,
      description: dto.description,
      category: dto.category,
      listing_type: dto.listing_type,
      user_id: userId,
      product_condition: dto.product_condition,
      price: dto.price,
      is_negotiable: dto.is_negotiable,
      deposit_required: dto.deposit_required,
      deposit_value: dto.deposit_value,
      cost_per_day: dto.cost_per_day,
      auto_close_date: dto.auto_close_date,
      rental_duration_limit: dto.rental_duration_limit,
      late_fee: dto.late_fee,
      desired_item: dto.desired_item,
      recipient_requirements: dto.recipient_requirements,
    });
    console.log('data on DB helper:', data);
    /* if (!data) {
      throw new HttpException(
        `Failed to create listing: No data returned`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } */
    if (error) {
      throw new HttpException(
        `Failed to create listing: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data as number;
  }

  /**
   * Updates the main image URL for a specific listing
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing to update
   * @param imageUrl - The URL of the main image
   * @returns Promise resolving when update is complete
   * @throws HttpException if update fails
   */
  static async updateListingImageUrl(
    supabase: SupabaseClient,
    listingId: number,
    imageUrl: string,
  ): Promise<void> {
    const { error } = await supabase.rpc('update_listing_image_url', {
      listing_id: listingId,
      image_url: imageUrl,
    });

    if (error) {
      throw new HttpException(
        `Failed to update listing image URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all available product categories from the database
   * @param supabase - Supabase client instance
   * @returns Promise containing an array of category names as strings
   * @throws HttpException if categories cannot be retrieved or if no data is returned
   */
  static async getProductCategories(
    supabase: SupabaseClient,
  ): Promise<string[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('category');

    if (error) {
      throw new HttpException(
        `Failed to fetch product categories: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!data) {
      throw new HttpException(
        'No data returned after fetching product categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const categories = data.map((item: { category: string }) => item.category);
    return categories;
  }

  /**
   * Soft deletes a listing by calling the Supabase RPC function
   * @param supabase - Supabase client instance
   * @param listingId - ID of the listing to soft delete
   * @throws HttpException if the soft delete operation fails
   */
  static async softDeleteListing(
    supabase: SupabaseClient,
    listingId: number,
  ): Promise<void> {
    const { error } = await supabase.rpc('soft_delete_listing', {
      listing_id: listingId,
    });

    if (error) {
      throw new HttpException(
        `Failed to soft delete listing: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
