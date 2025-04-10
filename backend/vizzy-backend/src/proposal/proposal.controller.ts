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
} from '@nestjs/common';
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
//import { Proposal } from '@/dtos/proposal/proposal.dto';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
@Controller('proposals')
export class ProposalController {
  constructor(
    private readonly ProposalService: ProposalService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('user-proposals')
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getProposals(
    @Req() req: RequestWithUser,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<ProposalResponseDto[]> {
    console.log('sera que chego pelo menos aqui');
    if (!req.user.sub) {
      throw new NotFoundException('User ID is required');
    }
    const userId = req.user.sub;

    const options = {
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };
    console.log(userId);
    const proposals = await this.ProposalService.getAllProposalsByUserId(
      userId,
      options,
    );

    console.log('Dados no controlador:', proposals);

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
    console.log('sera que chego pelo menos aqui');
    const proposal =
      await this.ProposalService.getProposalDetailsById(proposalId);

    console.log('Dados no controlador:', proposal);

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
    console.log(userId);
    const proposals = await this.ProposalService.getBasicProposalsSentByUserId(
      userId,
      options,
    );

    console.log('Dados no controlador:', proposals);

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
    console.log(userId);
    const proposals =
      await this.ProposalService.getBasicProposalsReceivedByUserId(
        userId,
        options,
      );

    console.log('Dados no controlador:', proposals);

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
    proposalDto.current_user_id = req.user.sub;
    const proposal = await this.ProposalService.createProposal(proposalDto);
    if (!proposal) {
      this.logger.error('Failed to create proposal', proposalDto);
      throw new Error('Failed to create proposal');
    }
    return proposal;
  }
}
