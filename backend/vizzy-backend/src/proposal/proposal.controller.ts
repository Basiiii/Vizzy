import { Controller, Post, Body, Version, Inject } from '@nestjs/common';
import { API_VERSIONS } from '@/constants/api-versions';
import { ProposalService } from './proposal.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
@Controller('proposals')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  @Post()
  @Version(API_VERSIONS.V1)
  async createProposal(@Body() proposalDto: CreateProposalDto) {
    this.logger.info('Using controller createProposal');
    if (!proposalDto) {
      throw new Error('Proposal data is required');
    }
    const proposal = await this.proposalService.createProposal(proposalDto);
    if (!proposal) {
      throw new Error('Failed to create proposal');
    }
    if (proposal.proposal_type == 'Swap') {
      return this.proposalService.createSwapProposal(proposalDto);
    }
    if (proposal.proposal_type == 'Sale') {
      return this.proposalService.createSaleProposal(proposalDto);
    }
    if (proposal.proposal_type == 'Rental') {
      return this.proposalService.createRentalProposal(proposalDto);
    }
  }
}
