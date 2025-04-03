import { Proposal } from './proposal.dto';

export class CreateProposalDto implements Proposal {
  id?: string;
  title: string;
  description: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  proposal_type: string;
  proposal_status: string;

  price?: number;
  start_date?: Date;
  end_date?: Date;
  offered_rent_per_day?: number;
  swap_with?: string;
}
