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
  Inject
} from '@nestjs/common';
import { API_VERSIONS } from '@/constants/api-versions';
import { ProposalService } from './proposal.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.auth.guard';
import { RequestWithUser } from '@/auth/types/jwt-payload.type';
import { Proposal } from '@/dtos/proposal/proposal.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalResponseDto } from '@/dtos/proposal/proposal-response.dto';

@Controller('proposals')
export class ProposalController {
  constructor(private readonly ProposalService: ProposalService) {}

  @Get()
  @Version(API_VERSIONS.V1)
  @UseGuards(JwtAuthGuard)
  async getProposals(
    @Req() req: RequestWithUser,
    @Query('page') page = '1',
    @Query('limit') limit = '8',
  ): Promise<Proposal[]> {
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

@Controller('proposals')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  @Post()
  @Version(API_VERSIONS.V1)
  async createProposal(
    @Body() proposalDto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    this.logger.info('Using controller createProposal');
    if (!proposalDto) {
      this.logger.error('Proposal data is required', proposalDto);
      throw new Error('Proposal data is required');
    }
    const proposal = await this.proposalService.createProposal(proposalDto);
    if (!proposal) {
      this.logger.error('Failed to create proposal', proposalDto);
      throw new Error('Failed to create proposal');
    }
    proposalDto.id = proposal.id;
    if (proposalDto.proposal_type == 'Swap') {
      return this.proposalService.createSwapProposal(proposalDto);
    }
    if (proposalDto.proposal_type == 'Sale') {
      return this.proposalService.createSaleProposal(proposalDto);
    }
    if (proposalDto.proposal_type == 'Rental') {
      return this.proposalService.createRentalProposal(proposalDto);
    }
  }
}
