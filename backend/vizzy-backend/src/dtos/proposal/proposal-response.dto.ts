import { Proposal, BasicProposalDto } from './proposal.dto';

export interface ProposalBasicResponseDto extends BasicProposalDto {
  id: number;
}

export interface ProposalResponseDto extends Proposal {
  proposal_id: number;
}

export class ProposalsWithCountDto {
  proposals: ProposalResponseDto[];
  totalProposals: number;
}
