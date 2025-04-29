import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { FAVORITE_CACHE_KEYS } from '@/constants/cache/favorite.cache-keys';
@Injectable()
export class FavoriteService {
  [x: string]: any;
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Adds a listing to the user's favorites.
   *
   * @param userId - The ID of the user.
   * @param adId - The ID of the listing (ad) to be favorited.
   * @throws Will throw an error if the insertion fails.
   */
  async addFavorite(userId: string, adId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, listing_id: adId });

    if (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }
    const cacheKey = FAVORITE_CACHE_KEYS.LIST_BY_USER(userId);
    await this.redisService.del(cacheKey);
  }
  /**
   * Removes a listing from the user's favorites.
   *
   * @param userId - The ID of the user.
   * @param adId - The ID of the listing (ad) to be removed from favorites.
   * @throws Will throw an error if the deletion fails.
   */

  async removeFavorite(userId: string, adId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', adId);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }

    const cacheKey = FAVORITE_CACHE_KEYS.LIST_BY_USER(userId);
    await this.redisService.del(cacheKey);
  }

  /**
   * Retrieves all favorite listings of a user by calling the `fetch_favorite` stored procedure.
   *
   * @param userId - The ID of the user.
   * @returns An array of favorite listings.
   * @throws Will throw an error if the fetch operation fails.
   */

  async getUserFavoriteProducts(userId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase.rpc('fetch_favorite', {
      p_user_id: userId,
    });

    console.log(data); // <- array com os favoritos

    if (error) {
      throw new Error(`Erro ao buscar favoritos: ${error.message}`);
    }
  }
}
