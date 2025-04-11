import { RedisService } from '@/redis/redis.service';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ProposalSimpleResponseDto,
  ProposalResponseDto,
} from '@/dtos/proposal/proposal-response.dto';
import { ProposalDatabaseHelper } from './helpers/proposal-database.helper';
import { BasicProposalDto } from '@/dtos/proposal/proposal.dto';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalImageHelper } from './helpers/proposal-image.helper';
import { CACHE_KEYS } from '@/constants/cache.constants';
import { ProposalCacheHelper } from './helpers/proposal-cache.helper';

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
  async getBasicProposalsSentByUserId(
    userId: string,
    options: ListingOptionsDto,
  ): Promise<BasicProposalDto[]> {
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedSentProposals = await ProposalCacheHelper.getSentProposalsFromCache(
      redisClient,
      userId,
    );
    if (cachedSentProposals) return cachedSentProposals;
 */
    const supabase = this.supabaseService.getAdminClient();
    const BasicProposalDtos =
      await ProposalDatabaseHelper.getBasicProposalsSentByUserId(
        supabase,
        userId,
        options,
      );

    console.log('dados no servico:', BasicProposalDtos);

    /*     if (proposals.length > 0) {
      await ProposalCacheHelper.cacheSentProposals(redisClient, userId, BasicProposalDtos);
    } */

    return BasicProposalDtos;
  }
  async getBasicProposalsReceivedByUserId(
    userId: string,
    options: ListingOptionsDto,
  ): Promise<BasicProposalDto[]> {
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedReceivedProposals = await ProposalCacheHelper.getReceivedProposalsFromCache(
      redisClient,
      userId,
    );
    if (cachedReceivedProposals) return cachedReceivedProposals;
 */
    const supabase = this.supabaseService.getAdminClient();
    const basicReceivedProposals =
      await ProposalDatabaseHelper.getBasicProposalsReceivedByUserId(
        supabase,
        userId,
        options,
      );

    console.log('dados no servico:', basicReceivedProposals);

    /*     if (proposals.length > 0) {
      await ProposalCacheHelper.cacheProposals(redisClient, userId, BasicProposalDtos);
    } */

    return basicReceivedProposals;
  }

  async getProposalDetailsById(
    proposalId: number,
  ): Promise<ProposalResponseDto> {
    this.logger.info('Using service getProposalDetailsById');
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedProposal = await ProposalCacheHelper.getProposalsFromCache(
      redisClient,
      userId,
    );
    if (cachedProposals) return cachedProposals;
 */
    const supabase = this.supabaseService.getAdminClient();
    const proposals = await ProposalDatabaseHelper.getProposalDataById(
      supabase,
      proposalId,
    );

    console.log('dados no servico:', proposals);

    /*     if (proposals.length > 0) {
      await ProposalCacheHelper.cacheProposals(redisClient, userId, proposals);
    } */

    return proposals;
  }

  async getBasicProposalsForUserIdByStatus(
    userId: string,
    status: string,
    options: ListingOptionsDto,
  ): Promise<ProposalResponseDto[]> {
    this.logger.info('Using service getProposalDetailsById');
    //const redisClient = this.redisService.getRedisClient();

    /*  const cachedProposal = await ProposalCacheHelper.getProposalsFromCache(
      redisClient,
      userId,
    );
    if (cachedProposals) return cachedProposals;
 */
    const supabase = this.supabaseService.getAdminClient();
    const proposals =
      await ProposalDatabaseHelper.getBasicProposalsForUserIdByStatus(
        supabase,
        userId,
        status,
        options,
      );

    console.log('dados no servico:', proposals);

    /*     if (proposals.length > 0) {
      await ProposalCacheHelper.cacheProposals(redisClient, userId, proposals);
    } */

    return proposals;
  }

  async createProposal(
    createProposalDto: CreateProposalDto,
    senderID: string,
  ): Promise<ProposalSimpleResponseDto> {
    this.logger.info('Using service createProposal');
    const supabase = this.supabaseService.getAdminClient();
    const proposal: ProposalSimpleResponseDto =
      await ProposalDatabaseHelper.insertProposal(
        supabase,
        createProposalDto,
        senderID,
      );
    this.logger.info('Proposal created successfully', proposal);
    return proposal;
  }
  async updateProposalStatus(
    proposalId: number,
    status: string,
  ): Promise<void> {
    this.logger.info('Updating proposal status', { proposalId, status });

    try {
      const supabase = this.supabaseService.getAdminClient();
      await ProposalDatabaseHelper.updateProposalStatus(
        supabase,
        proposalId,
        status,
      );

      this.logger.info('Proposal status updated successfully', {
        proposalId,
        status,
      });
    } catch (error) {
      this.logger.error('Failed to update proposal status', {
        proposalId,
        status,
        error: error.message,
      });
      throw new HttpException(
        'Failed to update proposal status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyProposalAccess(
    proposalId: number,
    userId: string,
  ): Promise<void> {
    this.logger.info(
      `Verifying access to proposal ID: ${proposalId} for user: ${userId}`,
    );

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('proposals')
      .select('sender_id, receiver_id')
      .eq('id', proposalId);

    if (error) {
      this.logger.error(`Error verifying proposal access: ${error.message}`);
      throw new HttpException(
        'Failed to verify proposal access',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Check if we got any results
    if (!data || data.length === 0) {
      this.logger.warn(`Proposal not found: ${proposalId}`);
      throw new HttpException('Proposal not found', HttpStatus.NOT_FOUND);
    }

    // Check if the user has access to any of the returned proposals
    const hasAccess = data.some(
      (proposal) =>
        proposal.sender_id === userId || proposal.receiver_id === userId,
    );

    if (!hasAccess) {
      this.logger.warn(
        `User ${userId} does not have access to proposal ${proposalId}`,
      );
      throw new HttpException(
        'You do not have permission to access this proposal',
        HttpStatus.FORBIDDEN,
      );
    }

    this.logger.info(`Access verified for proposal ID: ${proposalId}`);
  }

  async processAndUploadProposalImages(
    files: Express.Multer.File[],
    proposalId: number,
  ): Promise<{ images: { path: string; url: string }[] }> {
    this.logger.info(
      `Processing and uploading ${files.length} images for proposal ID: ${proposalId}`,
    );

    const supabase = this.supabaseService.getAdminClient();
    const results = [];

    for (const file of files) {
      try {
        ProposalImageHelper.validateImageType(file.mimetype, this.logger);

        const processedImage = await ProposalImageHelper.processImage(
          file.buffer,
          this.logger,
        );

        const result = await ProposalImageHelper.uploadImage(
          supabase,
          proposalId,
          processedImage,
          file.originalname,
          this.logger,
        );

        results.push(result.data);
      } catch (error) {
        this.logger.error(`Error processing image: ${error.message}`);
      }
    }

    if (results.length === 0) {
      throw new HttpException(
        'Failed to upload any images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { images: results };
  }

  async getProposalImageCount(proposalId: number): Promise<number> {
    this.logger.info(`Getting image count for proposal ID: ${proposalId}`);

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.storage
      .from('proposals')
      .list(`${proposalId}`);

    if (error) {
      this.logger.error(`Error getting proposal images: ${error.message}`);
      if (error.message.includes('not found')) {
        return 0;
      }
      throw new HttpException(
        'Failed to get proposal images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data ? data.length : 0;
  }

  async getProposalImages(
    proposalId: number,
  ): Promise<{ images: { path: string; url: string }[] }> {
    this.logger.info(`Getting proposal images for proposal ID: ${proposalId}`);

    const redisClient = this.redisService.getRedisClient();
    const cacheKey = CACHE_KEYS.PROPOSAL_IMAGES(proposalId);

    const cachedImages = await ProposalCacheHelper.getFromCache<{
      images: { path: string; url: string }[];
    }>(redisClient, cacheKey);

    if (cachedImages) {
      this.logger.info(
        `Retrieved proposal images from cache for ID: ${proposalId}`,
      );
      return cachedImages;
    }

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.storage
      .from('proposals')
      .list(`${proposalId}`);

    if (error) {
      this.logger.error(`Error getting proposal images: ${error.message}`);
      if (error.message.includes('not found')) {
        return { images: [] };
      }
      throw new HttpException(
        'Failed to get proposal images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data || data.length === 0) {
      this.logger.info(`No images found for proposal ID: ${proposalId}`);
      return { images: [] };
    }

    const images = data.map((file) => ({
      path: `${proposalId}/${file.name}`,
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/proposals/${proposalId}/${file.name}`,
    }));

    const response = { images };
    this.logger.info(
      `Found ${images.length} images for proposal ID: ${proposalId}`,
    );

    this.logger.info(
      `Caching ${images.length} images for proposal ID: ${proposalId}`,
    );

    await ProposalCacheHelper.setCache<{
      images: { path: string; url: string }[];
    }>(
      redisClient,
      cacheKey,
      response,
      3600, // Cache for 1 hour
    );

    return response;
  }
}
