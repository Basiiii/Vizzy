import { SupabaseClient } from '@supabase/supabase-js';
import { ListingBasic } from '@/dtos/listing/listing-basic.dto';

export class FavoritesDatabaseHelper {
  /**
   * Fetches all favorites for a user
   * @param supabase - Supabase client instance
   * @param userId - The ID of the user
   * @param limit - Number of items to return
   * @param offset - Number of items to skip
   * @returns Promise<ListingBasic[]>
   */
  static async fetchUserFavorites(
    supabase: SupabaseClient,
    userId: string,
    limit?: number,
    offset?: number,
  ): Promise<ListingBasic[]> {
    const { data, error } = await supabase.rpc('get_user_favorites', {
      p_user_id: userId,
      fetch_limit: limit || 10,
      fetch_offset: offset || 0,
    });

    if (error) {
      throw error;
    }

    if (!data) {
      return [];
    }

    return data as ListingBasic[];
  }

  /**
   * Gets a favorite by its ID
   * @param supabase - Supabase client instance
   * @param favoriteId - The ID of the favorite
   * @returns Promise<any>
   */
  static async getFavoriteById(
    supabase: SupabaseClient,
    favoriteId: number,
  ): Promise<any> {
    const { data: favorite, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('id', favoriteId)
      .single();

    if (error) {
      throw error;
    }

    return favorite;
  }

  /**
   * Inserts a new favorite
   * @param supabase - Supabase client instance
   * @param userId - The ID of the user
   * @param listingId - The ID of the listing to favorite
   * @returns Promise<any>
   */
  static async insertFavorite(
    supabase: SupabaseClient,
    userId: string,
    listingId: number,
  ): Promise<any> {
    console.log('Params in databaseHelper:', userId, listingId);
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        listing_id: listingId,
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      throw error;
    }

    return favorite;
  }

  /**
   * Deletes a favorite
   * @param supabase - Supabase client instance
   * @param listingId - The ID of the listing to remove from favorites
   * @param userId - The ID of the user
   * @returns Promise<void>
   */
  static async deleteFavorite(
    supabase: SupabaseClient,
    listingId: number,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('listing_id', listingId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }

  /**
   * Checks if a listing is favorited by a user
   * @param supabase - Supabase client instance
   * @param userId - The ID of the user
   * @param listingId - The ID of the listing to check
   * @returns Promise<boolean>
   */
  static async isListingFavorited(
    supabase: SupabaseClient,
    userId: string,
    listingId: number,
  ): Promise<boolean> {
    const { error } = await supabase
      .from('favorites')
      .select()
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }

    return true;
  }
}
