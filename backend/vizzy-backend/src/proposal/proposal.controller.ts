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
  Put,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { API_VERSIONS } from '@/constants/api-versions';
import { ProposalService } from './proposal.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ProposalBasicResponseDto,
  ProposalResponseDto,
} from '@/dtos/proposal/proposal-response.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalImagesResponseDto } from '@/dtos/proposal/proposal-images.dto';
import { ProposalsWithCountDto } from '@/dtos/proposal/proposal-response.dto';

@Controller('proposals')
export class ProposalController {
  constructor(
    private readonly ProposalService: ProposalService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  @Get()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getProposalsByFilters(
    @Req() req: RequestWithUser,
    @Query('received') received?: string,
    @Query('sent') sent?: string,
    @Query('accepted') accepted?: string,
    @Query('rejected') rejected?: string,
    @Query('canceled') canceled?: string,
    @Query('pending') pending?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<ProposalsWithCountDto> {
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      received: Boolean(received === 'true'),
      sent: Boolean(sent === 'true'),
      accepted: Boolean(accepted === 'true'),
      rejected: Boolean(rejected === 'true'),
      canceled: Boolean(canceled === 'true'),
      pending: Boolean(pending === 'true'),
      limit: parseInt(limit),
      offset: parseInt(page),
    };
    console.log('Filters on controller:', options);

    const proposals = await this.ProposalService.getUserBasicProposalsByFilter(
      userId,
      options,
    );

    if (proposals.totalProposals == 0) {
      throw new NotFoundException('No proposals found for this user');
    }

    return proposals;
  }

  @Get('proposal-data')
  @Version(API_VERSIONS.V1)
  async getProposalData(
    @Query('proposalId') proposalId: number,
  ): Promise<ProposalResponseDto> {
    console.log(`Proposal ID received: ${proposalId}`);
    const proposal =
      await this.ProposalService.getProposalDetailsById(proposalId);

    if (!proposal) {
      throw new NotFoundException('No proposals found for this user');
    }

    return proposal;
  }

  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async createProposal(
    @Req() req: RequestWithUser,
    @Body() proposalDto: CreateProposalDto,
  ): Promise<ProposalBasicResponseDto> {
    if (!proposalDto) {
      this.logger.error('Proposal data is required', proposalDto);
      throw new Error('Proposal data is required');
    }

    const senderID: string = req.user.sub;

    const proposal = await this.ProposalService.createProposal(
      proposalDto,
      senderID,
    );
    if (!proposal) {
      this.logger.error('Failed to create proposal');
      throw new Error('Failed to create proposal');
    }

    console.log('Proposal information:', proposal);

    return proposal;
  }

  @Put('update-status')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async updateProposalStatus(
    @Req() req: RequestWithUser,
    @Body('status') status: string,
    @Body('proposalId') proposalId: number,
  ) {
    if (!status || !proposalId || !req) {
      throw new HttpException(
        'Status and proposalId are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new HttpException(
        'Invalid status value. Must be pending, accepted, rejected or cancelled',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const userID = req.user.sub;
      await this.ProposalService.updateProposalStatus(
        proposalId,
        status,
        userID,
      );
    } catch (error) {
      this.logger.error('Failed to update proposal:', error.message);
      throw new HttpException(
        'Failed to update proposal status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':proposalId/images')
  @Version(API_VERSIONS.V1)
  async getProposalImages(
    @Param('proposalId', ParseIntPipe) proposalId: number,
  ): Promise<ProposalImagesResponseDto> {
    this.logger.info(
      'Using controller getProposalImages for proposal ID:',
      proposalId,
    );

    return this.ProposalService.getProposalImages(proposalId);
  }

  @Post(':proposalId/images')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 1 * 1024 * 1024 }, // 1MB per file
    }),
  )
  async uploadProposalImages(
    @Req() req: RequestWithUser,
    @UploadedFiles() files: Express.Multer.File[],
    @Param('proposalId', ParseIntPipe) proposalId: number,
  ) {
    this.logger.info(
      `Using controller uploadProposalImages for proposal ID: ${proposalId}`,
    );

    if (!files || files.length === 0) {
      this.logger.warn('No files provided for proposal images upload');
      throw new NotFoundException('No files provided');
    }

    await this.ProposalService.verifyProposalAccess(proposalId, req.user.sub);

    const existingImageCount =
      await this.ProposalService.getProposalImageCount(proposalId);
    const maxTotalImages = 10;
    const remainingSlots = maxTotalImages - existingImageCount;

    if (remainingSlots <= 0) {
      throw new HttpException(
        'Maximum number of images (10) already reached for this proposal',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (files.length > remainingSlots) {
      this.logger.warn(
        `User attempted to upload ${files.length} images but only ${remainingSlots} slots remaining`,
      );
      throw new HttpException(
        `You can only upload ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} for this proposal`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.ProposalService.processAndUploadProposalImages(
      files,
      proposalId,
    );
  }

  @Get('balance')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getProposalBalance(@Req() req: RequestWithUser): Promise<number> {
    const userId = req.user?.sub;
    const value = await this.ProposalService.getProposalBalanceByUserId(userId);
    return value;
  }
}
