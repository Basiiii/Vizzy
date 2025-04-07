import { Redis } from 'ioredis';
import { SimpleProposal } from '@/dtos/proposal/proposal.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { ProposalResponseDto } from '@/dtos/proposal/proposal-response.dto';

export class ProposalCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  static async getProposalsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<ProposalResponseDto[] | null> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedProposals = await redisClient.get(cacheKey);

    if (!cachedProposals) return null;

    try {
      return JSON.parse(cachedProposals) as ProposalResponseDto[];
    } catch (error) {
      console.error('Error parsing cached proposals:', error);
      return null;
    }
  }

  static async cacheProposals(
    redisClient: Redis,
    userId: string,
    proposals: ProposalResponseDto[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(proposals),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
  static async cacheProposal(
    redisClient: Redis,
    userId: string,
    proposal: ProposalResponseDto,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(proposal),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
  static async getProposalFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<ProposalResponseDto | null> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedProposals = await redisClient.get(cacheKey);

    if (!cachedProposals) return null;

    try {
      return JSON.parse(cachedProposals) as ProposalResponseDto[];
    } catch (error) {
      console.error('Error parsing cached proposals:', error);
      return null;
    }
  }
  static async getSentProposalsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<SimpleProposal[] | null> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedSentProposals = await redisClient.get(cacheKey);

    if (!cachedSentProposals) return null;

    try {
      return JSON.parse(cachedSentProposals) as SimpleProposal[];
    } catch (error) {
      console.error('Error parsing cached proposals:', error);
      return null;
    }
  }

  static async cacheSentProposals(
    redisClient: Redis,
    userId: string,
    sentProposals: SimpleProposal[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(sentProposals),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
  static async getReceivedProposalsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<SimpleProposal[] | null> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    const cachedReceivedProposals = await redisClient.get(cacheKey);

    if (!cachedReceivedProposals) return null;

    try {
      return JSON.parse(cachedReceivedProposals) as SimpleProposal[];
    } catch (error) {
      console.error('Error parsing cached proposals:', error);
      return null;
    }
  }

  static async cacheReceivedProposals(
    redisClient: Redis,
    userId: string,
    receivedProposals: SimpleProposal[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.PROFILE_LISTINGS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(receivedProposals),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }
}
