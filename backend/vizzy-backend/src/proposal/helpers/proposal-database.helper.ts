import { SupabaseClient } from '@supabase/supabase-js';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ProposalBasicResponseDto,
  ProposalResponseDto,
} from '@/dtos/proposal/proposal-response.dto';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { FetchProposalsDto } from '@/dtos/proposal/fetch-proposals.dto';
import { ProposalsWithCountDto } from '@/dtos/proposal/proposal-response.dto';

export class ProposalDatabaseHelper {
  static async fetchBasicProposalsByFilters(
    supabase: SupabaseClient,
    userId: string,
    filters: FetchProposalsDto,
  ): Promise<ProposalsWithCountDto> {
    const { data, error } = await supabase.rpc('fetch_filtered_proposals', {
      user_id: userId,
      fetch_limit: filters.limit,
      fetch_page: filters.offset,
      received: filters.received,
      sent: filters.sent,
      accepted: filters.accepted,
      rejected: filters.rejected,
      canceled: filters.canceled,
      pending: filters.pending,
    });
    if (error) throw new Error(error.message);

    const proposals = (data as ProposalResponseDto[]).map((item) => ({
      proposal_id: item.proposal_id,
      title: item.title,
      description: item.description,
      sender_id: item.sender_id,
      receiver_id: item.receiver_id,
      listing_id: item.listing_id,
      listing_title: item.listing_title,
      sender_name: item.sender_name,
      receiver_name: item.receiver_name,
      proposal_type: item.proposal_type,
      proposal_status: item.proposal_status,
      created_at: item.created_at,
      swap_with: item.swap_with ?? null,
      offered_price: item.offered_price ?? null,
      message: item.message ?? null,
      offered_rent_per_day: item.offered_rent_per_day ?? null,
      start_date: item.start_date ?? null,
      end_date: item.end_date ?? null,
    }));

    return {
      proposals,
      totalProposals: data[0]?.total_count || 0,
    };
  }

  static async getProposalsByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: ListingOptionsDto,
  ): Promise<ProposalsWithCountDto> {
    const { data, error } = await supabase.rpc('get_user_proposals', {
      user_id: userId,
      fetch_limit: options.limit,
      fetch_offset: options.offset,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch user proposals: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return {
        proposals: [],
        totalProposals: 0,
      };
    }
    console.log('Dados na BD:');
    console.log(data);

    const proposals = (data as ProposalResponseDto[]).map((item) => ({
      proposal_id: item.proposal_id,
      title: item.title,
      description: item.description,
      sender_id: item.sender_id,
      receiver_id: item.receiver_id,
      listing_id: item.listing_id,
      listing_title: item.listing_title,
      sender_name: item.sender_name,
      receiver_name: item.receiver_name,
      proposal_type: item.proposal_type,
      proposal_status: item.proposal_status,
      created_at: item.created_at,
      swap_with: item.swap_with ?? null,
      offered_price: item.offered_price ?? null,
      message: item.message ?? null,
      offered_rent_per_day: item.offered_rent_per_day ?? null,
      start_date: item.start_date ?? null,
      end_date: item.end_date ?? null,
    }));

    return {
      proposals,
      totalProposals: data[0]?.total_count || 0,
    };
  }
  static async getProposalDataById(
    supabase: SupabaseClient,
    proposalId: number,
  ): Promise<ProposalResponseDto | null> {
    const { data, error } = await supabase.rpc('get_proposal_json', {
      proposal_id: proposalId,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch proposal data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return null;
    }

    console.log('Dados na BD:');
    console.log(data);

    return {
      proposal_id: data.proposal_id,
      title: data.title,
      description: data.description,
      created_at: data.created_at,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      listing_id: data.listing_id,
      listing_title: data.listing_title,
      sender_name: data.sender_name,
      receiver_name: data.receiver_name,
      proposal_type: data.proposal_type,
      proposal_status: data.proposal_status,
      offered_price: data.offered_price ?? null,
      swap_with: data.swap_with ?? null,
      message: data.message ?? null,
      offered_rent_per_day: data.offered_rent_per_day ?? null,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
    };
  }

  static async insertProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
    sender_id: string,
  ): Promise<ProposalBasicResponseDto> {
    const { data, error } = await supabase.rpc('create_proposal', {
      title: dto.title,
      description: dto.description,
      listing_id: dto.listing_id,
      proposal_type: dto.proposal_type,
      proposal_status: dto.proposal_status,
      sender_id: sender_id,
      receiver_id: dto.receiver_id,
      offered_price: dto.offered_price,
      offered_rent_per_day: dto.offered_rent_per_day,
      start_date: dto.start_date,
      end_date: dto.end_date,
      message: dto.message,
      swap_with: dto.swap_with,
    });
    if (error) {
      throw new HttpException(
        `Failed to insert proposal: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (!data) {
      throw new HttpException(
        'No data returned after proposal creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const proposal: ProposalBasicResponseDto = data as ProposalBasicResponseDto;
    return proposal;
  }
  static async updateProposalStatus(
    supabase: SupabaseClient,
    proposalId: number,
    status: string,
    userId: string,
  ): Promise<void> {
    const { data, error } = await supabase.rpc('update_proposal_status', {
      proposal_id: proposalId,
      new_status: status,
      user_id: userId,
    });
    console.log('Erro no db helper:', error);

    if (error) {
      throw new HttpException(
        `Failed to update proposal status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      throw new HttpException(
        'No confirmation received for status update',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  static async getProposalBalance(
    supabase: SupabaseClient,
    userId: string,
  ): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_user_balance', {
      user_id: userId,
    });
    if (error) {
      throw new HttpException(
        `Failed to fetch user transactions value: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data as number;
  }
}
