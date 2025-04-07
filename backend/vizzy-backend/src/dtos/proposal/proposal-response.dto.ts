import { Proposal, SimpleProposal } from './proposal.dto';

export interface ProposalSimpleResponseDto extends SimpleProposal {
  id: string;
}

export interface ProposalResponseDto extends Proposal {
  id: string;
}
