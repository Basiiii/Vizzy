import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
@Injectable()
export class FavoriteService {
  [x: string]: any;
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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

    console.log(data); // <- array com os favoritos

    if (error) {
      throw new Error(`Erro ao buscar favoritos: ${error.message}`);
    }
  }
}
