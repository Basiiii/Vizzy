import { Proposal, BasicProposalDto } from './proposal.dto';

export interface ProposalSimpleResponseDto extends BasicProposalDto {
  id: string;
}

export interface ProposalResponseDto extends Proposal {
  proposal_id: number;
}
