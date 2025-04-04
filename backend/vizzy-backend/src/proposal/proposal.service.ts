import { Injectable } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { RedisService } from '@/redis/redis.service';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { ProposalCacheHelper } from './helpers/proposal-cache.helper';
import { ProposalDatabaseHelper } from './helpers/proposal-database.helper';

@Injectable()
export class ProposalService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}
  async getAllProposalsByUserId(userId: string, options: ListingOptionsDto) {
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedProposals = await ProposalCacheHelper.getProposalsFromCache(
      redisClient,
      userId,
    );
    if (cachedProposals) return cachedProposals;
 */
    const supabase = this.supabaseService.getAdminClient();
    const proposals = await ProposalDatabaseHelper.getProposalsByUserId(
      supabase,
      userId,
      options,
    );

    console.log('dados no servico:', proposals);

    /*     if (proposals.length > 0) {
      await ProposalCacheHelper.cacheProposals(redisClient, userId, proposals);
    } */

    return proposals;
  }
}
