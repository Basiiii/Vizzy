import { SupabaseClient } from '@supabase/supabase-js';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductListingBasic } from '@/dtos/product/product-listing-basic.dto';

export class FavoritesDatabaseHelper {
  static async getUserFavoriteProducts(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<ProductListingBasic[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_listings (id, name)')
      .eq('user_id', userId);

    if (error) {
      throw new HttpException(
        `Erro ao buscar favoritos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return [];
    }

    return data.map((fav: any) => fav.product_listings).filter(Boolean);
  }
}
