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
import { BasicProposalDto } from '@/dtos/proposal/proposal.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ProposalSimpleResponseDto,
  ProposalResponseDto,
} from '@/dtos/proposal/proposal-response.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalImagesResponseDto } from '@/dtos/proposal/proposal-images.dto';

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
    @Query('received') received?: boolean,
    @Query('sent') sent?: boolean,
    @Query('accepted') accepted?: boolean,
    @Query('rejected') rejected?: boolean,
    @Query('cancelled') cancelled?: boolean,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<ProposalResponseDto[]> {
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      received: received ? true : false,
      sent: sent ? true : false,
      accepted: accepted ? true : false,
      rejected: rejected ? true : false,
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    const proposals = await this.ProposalService.getUserBasicProposalsByFilter(
      userId,
      options,
    );

    if (!proposals.length) {
      throw new NotFoundException('No proposals found for this user');
    }

    return proposals;
  }

  @Get('user-proposals')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getProposals(
    @Req() req: RequestWithUser,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<ProposalResponseDto[]> {
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    const proposals = await this.ProposalService.getAllProposalsByUserId(
      userId,
      options,
    );

    if (!proposals.length) {
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

  @Get('basic-sent-proposals')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getBasicSentProposals(
    @Req() req: RequestWithUser,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<BasicProposalDto[]> {
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    const proposals = await this.ProposalService.getBasicProposalsSentByUserId(
      userId,
      options,
    );

    if (!proposals.length) {
      throw new NotFoundException('No proposals found for this user');
    }

    return proposals;
  }

  @Get('basic-received-proposals')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getBasicReceivedProposals(
    @Req() req: RequestWithUser,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<BasicProposalDto[]> {
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    const proposals =
      await this.ProposalService.getBasicProposalsReceivedByUserId(
        userId,
        options,
      );

    if (!proposals.length) {
      throw new NotFoundException('No proposals found for this user');
    }

    return proposals;
  }
  @Get('basic-proposals-by-status')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getBasicProposalsByStatus(
    @Req() req: RequestWithUser,
    @Query('status') status: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<BasicProposalDto[]> {
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };
    console.log(userId);
    const proposals =
      await this.ProposalService.getBasicProposalsForUserIdByStatus(
        userId,
        status,
        options,
      );

    console.log('Dados no controlador:', proposals);

    if (!proposals) {
      throw new NotFoundException('No proposals found for this user');
    }

    return proposals;
  }

  @Post()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async createProposal(
    @Req() req: RequestWithUser,
    @Body() proposalDto: CreateProposalDto,
  ): Promise<ProposalSimpleResponseDto> {
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
}
