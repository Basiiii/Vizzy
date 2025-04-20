import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ProposalResponseDto,
  ProposalsWithCountDto,
} from '@/dtos/proposal/proposal-response.dto';
import { ProposalDatabaseHelper } from './helpers/proposal-database.helper';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalImageHelper } from './helpers/proposal-image.helper';
import { ProposalStatus } from '@/constants/proposal-status.enum';
import { ProposalImageDto } from '@/dtos/proposal/proposal-images.dto';
import { FetchProposalsOptions } from './helpers/proposal-database.types';

/**
 * Service for handling proposal-related operations
 */
@Injectable()
export class ProposalService {
  private supabase: SupabaseClient;

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.supabase = this.supabaseService.getAdminClient();
  }

  /**
   * Retrieves a paginated and filtered list of proposals for a user
   * @param userId - The ID of the user
   * @param options - Filtering and pagination options
   * @returns Promise<ProposalsWithCountDto>
   */
  async findAll(
    userId: string,
    options: FetchProposalsOptions,
  ): Promise<ProposalsWithCountDto> {
    this.logger.info(
      `Service: Finding proposals for user ${userId} with options:`,
      options,
    );
    const result = await ProposalDatabaseHelper.fetchBasicProposalsByFilters(
      this.supabase,
      userId,
      options,
    );
    this.logger.info(
      `Service: Found ${result.totalProposals} proposals for user ${userId}`,
    );
    return result;
  }

  /**
   * Retrieves detailed data for a single proposal by its ID
   * @param proposalId - The ID of the proposal
   * @returns Promise<ProposalResponseDto | null>
   */
  async findOne(proposalId: number): Promise<ProposalResponseDto | null> {
    this.logger.info(`Service: Finding proposal details for ID: ${proposalId}`);
    const proposal = await ProposalDatabaseHelper.getProposalDataById(
      this.supabase,
      proposalId,
    );

    if (!proposal) {
      this.logger.warn(`Service: Proposal with ID ${proposalId} not found.`);
      return null;
    }

    this.logger.info(`Service: Found proposal details for ID: ${proposalId}`);
    return proposal;
  }

  /**
   * Creates a new proposal
   * @param createProposalDto - Data for creating a new proposal
   * @param senderId - The ID of the sender
   * @returns Promise<ProposalResponseDto>
   */
  async create(
    createProposalDto: CreateProposalDto,
    senderId: string,
  ): Promise<ProposalResponseDto> {
    this.logger.info(
      `Service: Creating proposal for sender ${senderId}`,
      createProposalDto,
    );

    try {
      const insertedProposalInfo = await ProposalDatabaseHelper.insertProposal(
        this.supabase,
        createProposalDto,
        senderId,
      );

      const newProposalId = insertedProposalInfo.id;
      this.logger.info(`Service: Proposal inserted with ID: ${newProposalId}`);

      const newProposal = await this.findOne(newProposalId);
      if (!newProposal) {
        this.logger.error(
          `Service: Failed to fetch newly created proposal with ID: ${newProposalId}`,
        );
        throw new HttpException(
          'Failed to retrieve created proposal details.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.info('Service: Proposal created successfully', newProposal);
      return newProposal;
    } catch (error) {
      this.logger.error(
        `Service: Error creating proposal for sender ${senderId}: ${error.message}`,
        { error: error.stack, dto: createProposalDto },
      );
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to create proposal due to a server error.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Updates the status of a specific proposal
   * @param proposalId - The ID of the proposal
   * @param status - The new status
   * @param userId - The ID of the user
   */
  async updateStatus(
    proposalId: number,
    status: ProposalStatus,
    userId: string,
  ): Promise<void> {
    this.logger.info(
      `Service: User ${userId} attempting to update proposal ${proposalId} status to ${status}`,
    );

    await this.verifyProposalAccess(proposalId, userId, true);

    try {
      await ProposalDatabaseHelper.updateProposalStatus(
        this.supabase,
        proposalId,
        status,
        userId,
      );
      this.logger.info(
        `Service: Proposal ${proposalId} status updated successfully to ${status}`,
      );
    } catch (error) {
      this.logger.error(
        `Service: Failed to update status for proposal ${proposalId}`,
        {
          status,
          error: error.message,
          stack: error.stack,
        },
      );
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to update proposal status in database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifies if a user has access to a proposal
   * @param proposalId - The ID of the proposal
   * @param userId - The ID of the user
   * @param checkReceiverOnly - Whether to check only for receiver access
   */
  async verifyProposalAccess(
    proposalId: number,
    userId: string,
    checkReceiverOnly: boolean = false,
  ): Promise<void> {
    this.logger.debug(
      `Service: Verifying access - Proposal: ${proposalId}, User: ${userId}, ReceiverOnly: ${checkReceiverOnly}`,
    );

    const proposalMeta = await ProposalDatabaseHelper.getProposalMetadata(
      this.supabase,
      proposalId,
    );

    if (!proposalMeta) {
      this.logger.warn(
        `Service: Access verification failed - Proposal ${proposalId} not found.`,
      );
      throw new NotFoundException(`Proposal with ID ${proposalId} not found`);
    }

    const isSender = proposalMeta.sender_id === userId;
    const isReceiver = proposalMeta.receiver_id === userId;

    if (checkReceiverOnly) {
      if (!isReceiver) {
        this.logger.warn(
          `Service: Access verification failed - User ${userId} is not the receiver for proposal ${proposalId}.`,
        );
        throw new ForbiddenException(
          'You do not have permission to modify this proposal status.',
        );
      }
    } else {
      if (!isSender && !isReceiver) {
        this.logger.warn(
          `Service: Access verification failed - User ${userId} is neither sender nor receiver for proposal ${proposalId}.`,
        );
        throw new ForbiddenException(
          'You do not have permission to access this proposal.',
        );
      }
    }

    this.logger.debug(
      `Service: Access verified successfully - Proposal: ${proposalId}, User: ${userId}`,
    );
  }

  /**
   * Retrieves images associated with a specific proposal
   * @param proposalId - The ID of the proposal
   * @returns Promise<{ images: ProposalImageDto[] }>
   */
  async getProposalImages(
    proposalId: number,
  ): Promise<{ images: ProposalImageDto[] }> {
    this.logger.info(`Service: Fetching images for proposal ID: ${proposalId}`);
    const images = await ProposalImageHelper.fetchProposalImageUrls(
      this.supabase,
      proposalId,
      this.logger,
    );
    return { images };
  }

  /**
   * Processes and uploads multiple images for a proposal
   * @param files - Array of files to upload
   * @param proposalId - The ID of the proposal
   * @param userId - The ID of the user
   * @returns Promise<{ images: ProposalImageDto[] }>
   */
  async processAndUploadProposalImages(
    files: Express.Multer.File[],
    proposalId: number,
    userId: string,
  ): Promise<{ images: ProposalImageDto[] }> {
    this.logger.info(
      `Service: User ${userId} processing ${files.length} images for proposal ${proposalId}`,
    );

    const proposalMeta = await ProposalDatabaseHelper.getProposalMetadata(
      this.supabase,
      proposalId,
    );
    if (!proposalMeta) {
      throw new NotFoundException(`Proposal with ID ${proposalId} not found`);
    }
    if (proposalMeta.sender_id !== userId) {
      throw new ForbiddenException(
        'Only the sender can upload images for a proposal.',
      );
    }

    const uploadedImages: ProposalImageDto[] = [];
    try {
      for (const file of files) {
        ProposalImageHelper.validateImageType(file.mimetype, this.logger);
        const processedBuffer = await ProposalImageHelper.processImage(
          file.buffer,
          this.logger,
        );
        const uploadResult = await ProposalImageHelper.uploadImage(
          this.supabase,
          proposalId,
          processedBuffer,
          file.originalname,
          this.logger,
        );
        uploadedImages.push(uploadResult.data);
      }

      this.logger.info(
        `Service: Successfully processed and uploaded ${uploadedImages.length} images for proposal ${proposalId}`,
      );
      return { images: uploadedImages };
    } catch (error) {
      this.logger.error(
        `Service: Error processing/uploading images for proposal ${proposalId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to process or upload proposal images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves the proposal balance (count of active proposals) for a user
   * @param userId - The ID of the user
   * @returns Promise<number>
   */
  async getProposalBalanceByUserId(userId: string): Promise<number> {
    this.logger.info(`Service: Fetching proposal balance for user ${userId}`);
    const balance = await ProposalDatabaseHelper.getProposalBalance(
      this.supabase,
      userId,
    );
    this.logger.info(
      `Service: Proposal balance for user ${userId} is ${balance}`,
    );
    return balance;
  }
}
