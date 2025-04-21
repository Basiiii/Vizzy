import {
  Controller,
  Post,
  Body,
  Get,
  NotFoundException,
  UseGuards,
  Req,
  Query,
  Version,
  Inject,
  Patch,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  Param,
  HttpException,
  HttpStatus,
  UsePipes,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { API_VERSIONS } from '@/constants/api-versions';
import { ProposalService } from './proposal.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ProposalResponseDto,
  ProposalsWithCountDto,
} from '@/dtos/proposal/proposal-response.dto';
import {
  CreateProposalDto,
  createProposalSchema,
} from '@/dtos/proposal/create-proposal.dto';
import { ProposalImagesResponseDto } from '@/dtos/proposal/proposal-images.dto';
import {
  FetchProposalsDto,
  fetchProposalsSchema,
} from '@/dtos/proposal/fetch-proposals.dto';
import { UpdateProposalStatusDto } from '@/dtos/proposal/update-proposal-status.dto';
import { ProposalBalanceDto } from '@/dtos/proposal/proposal-balance.dto';
import { FetchProposalsOptions } from './helpers/proposal-database.types';
import { ProposalStatus } from '@/constants/proposal-status.enum';
import { ProposalStatusHelper } from './helpers/proposal-status.helper';

@ApiTags('Proposals')
@Controller('proposals')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Get all proposals for the logged-in user
   * @param req - The request object with user information
   * @param queryParams - Query parameters for filtering and pagination
   * @returns Promise<ProposalsWithCountDto>
   */
  @Get()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(fetchProposalsSchema))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all proposals for the logged-in user' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({
    name: 'status',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
    required: false,
  })
  @ApiQuery({
    name: 'type',
    enum: ['SENT', 'RECEIVED'],
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of proposals and total count',
    type: ProposalsWithCountDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query() queryParams: FetchProposalsDto,
  ): Promise<ProposalsWithCountDto> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    this.logger.debug(
      `Controller: Validated query params after Zod pipe for user ${userId}:`,
      queryParams,
    );

    const options: FetchProposalsOptions = {
      ...queryParams,
      page: queryParams.page,
      limit: queryParams.limit,
    };

    return this.proposalService.findAll(userId, options);
  }

  /**
   * Get the active proposal balance for the user
   * @param req - The request object with user information
   * @returns Promise<ProposalBalanceDto>
   */
  @Get('balance')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the active proposal balance for the user' })
  @ApiResponse({
    status: 200,
    description: 'User proposal balance',
    type: ProposalBalanceDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProposalBalance(
    @Req() req: RequestWithUser,
  ): Promise<ProposalBalanceDto> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    this.logger.info(
      `Controller: Fetching proposal balance for user ${userId}`,
    );
    const balance =
      await this.proposalService.getProposalBalanceByUserId(userId);
    return { balance };
  }

  /**
   * Get details of a specific proposal
   * @param req - The request object with user information
   * @param proposalId - ID of the proposal
   * @returns Promise<ProposalResponseDto>
   */
  @Get(':proposalId')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a specific proposal' })
  @ApiParam({
    name: 'proposalId',
    type: Number,
    description: 'ID of the proposal',
  })
  @ApiResponse({
    status: 200,
    description: 'Proposal details',
    type: ProposalResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Access Denied)' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async findOne(
    @Req() req: RequestWithUser,
    @Param('proposalId', ParseIntPipe) proposalId: number,
  ): Promise<ProposalResponseDto> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    this.logger.info(
      `Controller: User ${userId} fetching details for proposal ID: ${proposalId}`,
    );
    try {
      await this.proposalService.verifyProposalAccess(proposalId, userId);
    } catch (error) {
      this.logger.warn(
        `Controller: Access denied for user ${userId} to proposal ${proposalId}. Error: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new ForbiddenException('Access denied to this proposal.');
    }
    const proposal = await this.proposalService.findOne(proposalId);
    if (!proposal) {
      this.logger.warn(
        `Controller: Proposal ${proposalId} not found after access check for user ${userId}.`,
      );
      throw new NotFoundException(`Proposal with ID ${proposalId} not found`);
    }
    return proposal;
  }

  /**
   * Create a new proposal
   * @param req - The request object with user information
   * @param createProposalDto - Data for creating a new proposal
   * @returns Promise<ProposalResponseDto>
   */
  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createProposalSchema))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new proposal' })
  @ApiBody({ type: CreateProposalDto })
  @ApiResponse({
    status: 201,
    description: 'Proposal created successfully',
    type: ProposalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: RequestWithUser,
    @Body() createProposalDto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    const senderId = req.user?.sub;
    if (!senderId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    this.logger.info(
      `Controller: User ${senderId} creating proposal (validated DTO):`,
      createProposalDto,
    );
    try {
      const proposal = await this.proposalService.create(
        createProposalDto,
        senderId,
      );
      this.logger.info(
        `Controller: Proposal created successfully with ID: ${proposal.id}`,
      );
      return proposal;
    } catch (error) {
      this.logger.error(
        `Controller: Failed to create proposal for user ${senderId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create proposal.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update the status of a proposal
   * @param req - The request object with user information
   * @param proposalId - ID of the proposal
   * @param updateProposalStatusDto - New status data
   */
  @Patch(':proposalId/status')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the status of a proposal (receiver only)' })
  @ApiParam({
    name: 'proposalId',
    type: Number,
    description: 'ID of the proposal',
  })
  @ApiBody({ type: UpdateProposalStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not the receiver)' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('proposalId', ParseIntPipe) proposalId: number,
    @Body() body: UpdateProposalStatusDto,
  ): Promise<void> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    let statusEnum: ProposalStatus;
    try {
      statusEnum = ProposalStatusHelper.parseAndValidateStatus(body);
      this.logger.debug(`Parsed status: ${statusEnum}`);
    } catch (error) {
      this.logger.error(`Controller: Invalid status value: ${error.message}`);
      throw new HttpException(
        `Invalid status value. Must be one of: ${Object.values(ProposalStatus).join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.info(
      `Controller: User ${userId} updating status for proposal ${proposalId} to: ${statusEnum}`,
    );

    try {
      await this.proposalService.updateStatus(proposalId, statusEnum, userId);
    } catch (error) {
      this.logger.error(
        `Controller: Failed to update status for proposal ${proposalId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update proposal status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get images associated with a proposal
   * @param req - The request object with user information
   * @param proposalId - ID of the proposal
   * @returns Promise<ProposalImagesResponseDto>
   */
  @Get(':proposalId/images')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get images associated with a proposal' })
  @ApiParam({
    name: 'proposalId',
    type: Number,
    description: 'ID of the proposal',
  })
  @ApiResponse({
    status: 200,
    description: 'List of proposal images',
    type: ProposalImagesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Access Denied)' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  async getProposalImages(
    @Req() req: RequestWithUser,
    @Param('proposalId', ParseIntPipe) proposalId: number,
  ): Promise<ProposalImagesResponseDto> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    this.logger.info(
      `Controller: User ${userId} fetching images for proposal ID: ${proposalId}`,
    );
    try {
      await this.proposalService.verifyProposalAccess(proposalId, userId);
    } catch (error) {
      this.logger.warn(
        `Controller: Access denied for user ${userId} to proposal images ${proposalId}. Error: ${error.message}`,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new ForbiddenException("Access denied to this proposal's images.");
    }
    const result = await this.proposalService.getProposalImages(proposalId);
    return result;
  }

  /**
   * Upload images for a proposal
   * @param req - The request object with user information
   * @param files - Array of uploaded files
   * @param proposalId - ID of the proposal
   * @returns Promise<ProposalImagesResponseDto>
   */
  @Post(':proposalId/images')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 1 * 1024 * 1024 },
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload images for a proposal (sender only)' })
  @ApiParam({
    name: 'proposalId',
    type: Number,
    description: 'ID of the proposal to add images to',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image files to upload (max 10 files, 1MB each)',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    type: ProposalImagesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No files provided or invalid file type/size',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not the sender)' })
  @ApiResponse({ status: 404, description: 'Proposal not found' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during upload/processing',
  })
  @HttpCode(HttpStatus.CREATED)
  async uploadProposalImages(
    @Req() req: RequestWithUser,
    @UploadedFiles() files: Express.Multer.File[],
    @Param('proposalId', ParseIntPipe) proposalId: number,
  ): Promise<ProposalImagesResponseDto> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    this.logger.info(
      `Controller: User ${userId} uploading ${files?.length ?? 0} files for proposal ID: ${proposalId}`,
    );
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this.proposalService.processAndUploadProposalImages(
        files,
        proposalId,
        userId,
      );
      this.logger.info(
        `Controller: Successfully uploaded ${result.images.length} images for proposal ${proposalId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Controller: Failed to upload images for proposal ${proposalId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to upload proposal images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
