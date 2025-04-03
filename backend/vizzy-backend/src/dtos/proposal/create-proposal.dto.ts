import { Proposal } from './proposal.dto';

export class CreateProposalDto implements Proposal {
  title: string;
  description: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  proposal_type: string;
  proposal_status: string;
}
