export interface CreateProposalDto {
  current_user_id: string;
  title: string;
  description: string;
  listing_id: number;
  proposal_type: string;
  proposal_status: string;
  offered_rent_per_day?: number;
  start_date?: Date;
  end_date?: Date;
  offered_price?: number;
  swap_with?: string;
  message?: string;
  target_username?: string;
}
