import { RedisService } from '@/redis/redis.service';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
//import { ProposalCacheHelper } from './helpers/proposal-cache.helper';
import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ProposalSimpleResponseDto,
  ProposalResponseDto,
} from '@/dtos/proposal/proposal-response.dto';
import { ProposalDatabaseHelper } from './helpers/proposal-database.helper';
import { Proposal, SimpleProposal } from '@/dtos/proposal/proposal.dto';
@Injectable()
export class ProposalService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  async getAllProposalsByUserId(
    userId: string,
    options: ListingOptionsDto,
  ): Promise<ProposalResponseDto[]> {
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
  async getSimpleProposalsSentByUserId(
    userId: string,
    options: ListingOptionsDto,
  ): Promise<SimpleProposal[]> {
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedSentProposals = await ProposalCacheHelper.getSentProposalsFromCache(
      redisClient,
      userId,
    );
    if (cachedSentProposals) return cachedSentProposals;
 */
    const supabase = this.supabaseService.getAdminClient();
    const simpleProposals =
      await ProposalDatabaseHelper.getSimpleProposalsSentByUserId(
        supabase,
        userId,
        options,
      );

    console.log('dados no servico:', simpleProposals);

    /*     if (proposals.length > 0) {
      await ProposalCacheHelper.cacheSentProposals(redisClient, userId, simpleProposals);
    } */

    return simpleProposals;
  }
  async getSimpleProposalsReceivedByUserId(
    userId: string,
    options: ListingOptionsDto,
  ): Promise<SimpleProposal[]> {
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedReceivedProposals = await ProposalCacheHelper.getReceivedProposalsFromCache(
      redisClient,
      userId,
    );
    if (cachedReceivedProposals) return cachedReceivedProposals;
 */
    const supabase = this.supabaseService.getAdminClient();
    const simpleReceivedProposals =
      await ProposalDatabaseHelper.getSimpleProposalsReceivedByUserId(
        supabase,
        userId,
        options,
      );

    console.log('dados no servico:', simpleReceivedProposals);

    /*     if (proposals.length > 0) {
      await ProposalCacheHelper.cacheProposals(redisClient, userId, simpleProposals);
    } */

    return simpleReceivedProposals;
  }

  async getProposalDetailsById(proposalId: string): Promise<Proposal> {
    this.logger.info('Using service getProposalDetailsById');
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedProposal = await ProposalCacheHelper.getProposalsFromCache(
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

  async createProposal(createProposalDto: Proposal): Promise<Proposal> {
    this.logger.info('Using service createProposal');
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertProposal(
      supabase,
      createProposalDto,
    );
    this.logger.info('Proposal created successfully', proposal);
    return proposal;
  }
  async createSwapProposal(
    createProposalDto: Proposal,
  ): Promise<ProposalSimpleResponseDto> {
    this.logger.info('Using service createSwapProposal');
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertSwapProposal(
      supabase,
      createProposalDto,
    );
    this.logger.info('Swap proposal created successfully', proposal);
    return proposal;
  }
  async createRentalProposal(
    createProposalDto: Proposal,
  ): Promise<ProposalSimpleResponseDto> {
    this.logger.info('Using service createRentalProposal');
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertRentalProposal(
      supabase,
      createProposalDto,
    );
    this.logger.info('Rental proposal created successfully', proposal);
    return proposal;
  }
  async createSaleProposal(
    createProposalDto: Proposal,
  ): Promise<ProposalSimpleResponseDto> {
    this.logger.info('Using service createSaleProposal');
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertSaleProposal(
      supabase,
      createProposalDto,
    );
    this.logger.info('Sale proposal created successfully', proposal);
    return proposal;
  }
}
