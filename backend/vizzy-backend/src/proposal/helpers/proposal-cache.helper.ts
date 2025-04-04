import { Redis } from 'ioredis';
import { Proposal } from '@/dtos/proposal/proposal.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';

export class ProposalCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  static async getProposalsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<Proposal[] | null> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedProposals = await redisClient.get(cacheKey);

    if (!cachedProposals) return null;

    try {
      return JSON.parse(cachedProposals) as Proposal[];
    } catch (error) {
      console.error('Error parsing cached proposals:', error);
      return null;
    }
  }

  static async cacheProposals(
    redisClient: Redis,
    userId: string,
    proposals: Proposal[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(proposals),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
}
