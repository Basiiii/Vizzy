import { SupabaseClient } from '@supabase/supabase-js';
import { CreateFavoriteDto } from '@/dtos/favorite/createfavorite.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class FavoriteDatabaseHelper {
  static async getUserById(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId });

    if (error) {
      throw new HttpException(
        `Failed to add favorite: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  static async removeFavorite(
    supabase: SupabaseClient,
    userId: string,
    adId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', adId);

    if (error) {
      throw new HttpException(
        `Failed to remove favorite: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  static async getUserFavoriteProducts(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<any[]> {
    const { data, error } = await supabase.rpc('fetch_favorite', {
      p_user_id: userId,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch favorites: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data;
  }
}
