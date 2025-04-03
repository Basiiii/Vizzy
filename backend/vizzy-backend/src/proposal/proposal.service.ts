import { Injectable, Inject } from '@nestjs/common';
import { SupabaseService } from '@/supabase/supabase.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProposalResponseDto } from '@/dtos/proposal/proposal-response.dto';
import { ProposalDatabaseHelper } from './helpers/proposal-database.helper';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
@Injectable()
export class ProposalService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createProposal(
    createProposalDto: CreateProposalDto,
  ): Promise<CreateProposalDto> {
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertProposal(
      supabase,
      createProposalDto,
    );
    return proposal;
  }
  async createSwapProposal(
    createProposalDto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertSwapProposal(
      supabase,
      createProposalDto,
    );
    return proposal;
  }
  async createRentalProposal(
    createProposalDto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertRentalProposal(
      supabase,
      createProposalDto,
    );
    return proposal;
  }
  async createSaleProposal(
    createProposalDto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    const supabase = this.supabaseService.getAdminClient();
    const proposal = await ProposalDatabaseHelper.insertSaleProposal(
      supabase,
      createProposalDto,
    );
    return proposal;
  }
}
