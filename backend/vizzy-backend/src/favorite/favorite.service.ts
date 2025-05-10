import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { FAVORITE_CACHE_KEYS } from '@/constants/cache/favorite.cache-keys';
import { FavoriteDatabaseHelper } from './helpers/favorite-database.helper';
import { RedisService } from '@/redis/redis.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GlobalCacheHelper } from '@/common/helpers/global-cache.helper';

@Injectable()
export class FavoriteService {
  [x: string]: any;
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Adds a listing to the user's favorites.
   *
   * @param userId - The ID of the user.
   * @param listing_id - The ID of the listing (ad) to be favorited.
   * @throws Will throw an error if the insertion fails.
   */
  async addFavorite(userId: string, listing_id: number): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    try {
      await FavoriteDatabaseHelper.addUserFavorite(supabase, userId);

      const cacheKey = FAVORITE_CACHE_KEYS.LIST_BY_USER(userId);
      await this.redisService.del(cacheKey); // limpa cache dos favoritos do usuário
    } catch (error) {
      this.logger.error(`Erro ao adicionar favorito: ${error.message}`, {
        userId,
        listing_id,
      });
      throw new HttpException(
        'Erro ao adicionar favorito',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  /**
   * Removes a listing from the user's favorites.
   *
   * @param userId - The ID of the user.
   * @param adId - The ID of the listing (ad) to be removed from favorites.
   * @throws Will throw an error if the deletion fails.
   */

  async removeFavorite(userId: string, listing_id: number): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    try {
      await FavoriteDatabaseHelper.removeFavorite(supabase, userId, listing_id);

      const cacheKey = FAVORITE_CACHE_KEYS.LIST_BY_USER(userId);
      await this.redisService.del(cacheKey); // invalida cache do usuário
    } catch (error) {
      this.logger.error(`Erro ao remover favorito: ${error.message}`, {
        userId,
        listing_id,
      });
      throw new HttpException(
        'Erro ao remover favorito',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all favorite listings of a user by calling the `fetch_favorite` stored procedure.
   *
   * @param userId - The ID of the user.
   * @returns An array of favorite listings.
   * @throws Will throw an error if the fetch operation fails.
   */

  async getUserFavoriteProducts(userId: string) {
    const cacheKey = FAVORITE_CACHE_KEYS.LIST_BY_USER(userId);

    const cached = await this.redisService.get(cacheKey);
    if (cached !== null && cached !== undefined) {
      this.logger.debug(`Favoritos de ${userId} retornados do cache`);
      /*return JSON.parse(cached);*/
    }

    const supabase = this.supabaseService.getAdminClient();

    try {
      const favorites = await FavoriteDatabaseHelper.getUserFavoriteProducts(
        supabase,
        userId,
      );
      await this.redisService.set(cacheKey, JSON.stringify(favorites), {
        ex: 60,
      }); // cache por 60s
      return favorites;
    } catch (error) {
      this.logger.error(`Erro ao obter favoritos: ${error.message}`, {
        userId,
      });
      throw new HttpException(
        'Erro ao obter favoritos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
