import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
@Injectable()
export class FavoriteService {
  [x: string]: any;
  constructor(private readonly supabaseService: SupabaseService) {}

  async addFavorite(userId: string, adId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, listing_id: adId });

    if (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }
  }

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
  }

  async getUserFavoriteProducts(userId: string) {
    const supabase = this.supabaseService.getAdminClient();
    const { data, error } = await supabase.rpc('fetch_favorite', {
      p_user_id: userId,
    });

    console.log(data);

    if (error) {
      throw new Error(`Erro ao buscar favoritos: ${error.message}`);
    }
  }
}
