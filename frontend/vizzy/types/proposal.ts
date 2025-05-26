export interface Proposal {
  id: number;
  title?: string;
  description: string;
  sender_id: string;
  receiver_id?: string;
  listing_id: string;
  proposal_type: 'sale' | 'rental' | 'swap' | 'giveaway';
  proposal_status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  sender_name: string;
  sender_username: string;
  receiver_name: string;
  receiver_username: string;
  listing_title: string;
  offered_rent_per_day?: number;
  start_date?: Date;
  end_date?: Date;
  offered_price?: number;
  swap_with?: string;
  message?: string;

  images?: string[];
}

export interface ProposalsWithCount {
  proposals: Proposal[];
  totalProposals: number;
}
