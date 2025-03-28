import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { Listing } from '@/dtos/listing/listing.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { ListingCacheHelper } from './helpers/listing-cache.helper';
import { ListingDatabaseHelper } from './helpers/listing-database.helper';

@Injectable()
export class ListingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  async getListingsByUserId(
    userId: string,
    options: ListingOptionsDto,
  ): Promise<Listing[]> {
    const redisClient = this.redisService.getRedisClient();

    const cachedListings = await ListingCacheHelper.getListingsFromCache(
      redisClient,
      userId,
    );
    if (cachedListings) return cachedListings;

    const supabase = this.supabaseService.getPublicClient();
    const listings = await ListingDatabaseHelper.getListingsByUserId(
      supabase,
      userId,
      options,
    );

    if (listings.length > 0) {
      await ListingCacheHelper.cacheListings(redisClient, userId, listings);
    }

    return listings;
  }

  async getListingById(anuncioId: string): Promise<Listing> {
    const supabase = this.supabaseService.getPublicClient();
    const { data: anuncio, error } = await supabase
      .from('anuncios')
      .select(
        'id, nome, estado, descricao, preco, anunciante:nome, telefone, membroDesde',
      )
      .eq('id', anuncioId)
      .single();

    if (error || !anuncio) {
      throw new NotFoundException('Ad not found');
    }
    return anuncio.id;
  }
}
