import { Redis } from 'ioredis';
import { BasicProposalDto } from '@/dtos/proposal/proposal.dto';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { ProposalResponseDto } from '@/dtos/proposal/proposal-response.dto';

export class ProposalCacheHelper {
  private static readonly CACHE_EXPIRATION = 3600; // 1 hour

  static async getProposalsFromCache(
    redisClient: Redis,
    userId: string,
  ): Promise<ProposalResponseDto[] | null> {
    const cacheKey = CACHE_KEYS.PROPOSALS(userId);
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
    const cacheKey = CACHE_KEYS.PROPOSALS(userId);
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
  ) {
    const cacheKey = CACHE_KEYS.PROPOSAL_DETAIL(userId);
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
  ): Promise<ProposalResponseDto[] | null> {
    const cacheKey = CACHE_KEYS.PROPOSAL_DETAIL(userId);
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
  ): Promise<BasicProposalDto[] | null> {
    const cacheKey = CACHE_KEYS.SENT_PROPOSALS(userId);
    const cachedSentProposals = await redisClient.get(cacheKey);

    if (!cachedSentProposals) return null;

    try {
      return JSON.parse(cachedSentProposals) as BasicProposalDto[];
    } catch (error) {
      console.error('Error parsing cached proposals:', error);
      return null;
    }
  }

  static async cacheSentProposals(
    redisClient: Redis,
    userId: string,
    sentProposals: BasicProposalDto[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.SENT_PROPOSALS(userId);
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
  ): Promise<BasicProposalDto[] | null> {
    const cacheKey = CACHE_KEYS.RECEIVED_PROPOSALS(userId);
    const cachedReceivedProposals = await redisClient.get(cacheKey);

    if (!cachedReceivedProposals) return null;

    try {
      return JSON.parse(cachedReceivedProposals) as BasicProposalDto[];
    } catch (error) {
      console.error('Error parsing cached proposals:', error);
      return null;
    }
  }

  static async cacheReceivedProposals(
    redisClient: Redis,
    userId: string,
    receivedProposals: BasicProposalDto[],
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.RECEIVED_PROPOSALS(userId);
    await redisClient.set(
      cacheKey,
      JSON.stringify(receivedProposals),
      'EX',
      this.CACHE_EXPIRATION,
    );
  }

  static async getFromCache<T>(
    redisClient: Redis,
    cacheKey: string,
  ): Promise<T | null> {
    const cachedData = await redisClient.get(cacheKey);

    if (!cachedData) return null;

    try {
      return JSON.parse(cachedData) as T;
    } catch (error) {
      console.error('Error parsing cached data:', error);
      return null;
    }
  }

  static async setCache<T>(
    redisClient: Redis,
    cacheKey: string,
    data: T,
    expirationInSeconds = this.CACHE_EXPIRATION,
  ): Promise<void> {
    await redisClient.set(
      cacheKey,
      JSON.stringify(data),
      'EX',
      expirationInSeconds,
    );
  }
}
