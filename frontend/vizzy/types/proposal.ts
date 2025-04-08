export interface Proposal {
  id: number;
  title?: string;
  description: string;
  sender_id?: string;
  receiver_id?: string;
  listing_id: string;
  proposal_type: 'Sale' | 'Rental' | 'Swap';
  proposal_status: 'Pending' | 'Accepted' | 'Rejected';
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
  listing_title?: string;
  offered_rent_per_day?: number;
  start_date?: Date;
  end_date?: Date;
  offered_price?: number;
  swap_with?: string;
  message?: string;

  images?: string[];
}
