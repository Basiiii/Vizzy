export interface Proposal {
  id?: string;
  listing_id: string;
  user_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  proposal_type: 'sale' | 'rental' | 'giveaway' | 'swap';
  value: number;
  value_per_day?: number;
  swap_with?: string;
  linting_title?: string;
  sender_name?: string;
  title?: string;
  images?: string[];
}
