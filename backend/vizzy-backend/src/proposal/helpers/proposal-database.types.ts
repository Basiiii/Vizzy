import { ProposalStatus } from '@/constants/proposal-status.enum';
import { ProposalType } from '@/constants/proposal-types.enum';
import { FetchProposalsQueryType } from '@/dtos/proposal/fetch-proposals.dto';

/**
 * Options for fetching proposals with pagination
 */
export type FetchProposalsOptions = FetchProposalsQueryType & {
  page: number;
  limit: number;
};

/**
 * Raw data structure returned by fetch_filtered_proposals
 */
export interface RawProposalListData {
  proposal_id: number;
  title: string;
  description: string;
  sender_id: string;
  receiver_id: string;
  listing_id: number;
  listing_title: string;
  sender_name: string;
  sender_username: string;
  receiver_name: string;
  receiver_username: string;
  proposal_type: string;
  proposal_status: string;
  created_at: string;
  swap_with?: string | null;
  offered_price?: number | null;
  message?: string | null;
  offered_rent_per_day?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  total_count: number;
}

/**
 * Single proposal JSONB returned by get_proposal_json
 */
export interface RawSingleProposalData {
  proposal_id: number;
  title: string;
  description: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  listing_id: number;
  listing_title: string;
  sender_name: string;
  sender_username: string;
  receiver_name: string;
  receiver_username: string;
  proposal_type: string;
  proposal_status_id: number;
  proposal_status: string;
  offered_price?: number | null;
  swap_with?: string | null;
  message?: string | null;
  offered_rent_per_day?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

/**
 * Arguments for fetch_filtered_proposals RPC call
 */
export interface FetchFilteredProposalsArgs {
  user_id: string;
  fetch_limit: number;
  fetch_page: number;
  received: boolean;
  sent: boolean;
  accepted: boolean;
  rejected: boolean;
  cancelled: boolean;
  pending: boolean;
}

/**
 * Arguments for get_proposal_json RPC call
 */
export interface GetProposalJsonArgs {
  proposal_id: number;
}

/**
 * Arguments for create_proposal RPC call
 */
export interface CreateProposalArgs {
  title: string;
  description: string;
  listing_id: number;
  proposal_type: ProposalType;
  proposal_status: ProposalStatus;
  sender_id: string;
  receiver_id: string;
  offered_price: number | null;
  offered_rent_per_day: number | null;
  start_date: string | null;
  end_date: string | null;
  message: string | null;
  swap_with: string | null;
}

/**
 * Arguments for update_proposal_status RPC call
 */
export interface UpdateProposalStatusArgs {
  user_id: string;
  proposal_id: number;
  new_status: ProposalStatus;
}

/**
 * Arguments for calculate_user_balance RPC call
 */
export interface CalculateUserBalanceArgs {
  user_id: string;
}

/**
 * Return type for create_proposal RPC call
 */
export type CreateProposalReturn = {
  id: number;
  title: string;
  description: string;
};
