import { SupabaseClient } from '@supabase/supabase-js';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ProposalSimpleResponseDto,
  ProposalResponseDto,
} from '@/dtos/proposal/proposal-response.dto';
import { Proposal } from '@/dtos/proposal/proposal.dto';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';

export class ProposalDatabaseHelper {
  static async getProposalsByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: ListingOptionsDto,
  ): Promise<ProposalResponseDto[]> {
    const { data, error } = await supabase.rpc('get_user_proposals', {
      p_user_id: userId,
      p_limit: options.limit,
      p_offset: options.offset,
    });

    if (error) {
      throw new HttpException(
        `Failed to fetch user proposals: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return [];
    }
    console.log('Dados na BD:');
    console.log(data);

    return (data as ProposalResponseDto[]).map((item) => {
      return {
        proposal_id: item.proposal_id,
        title: item.title,
        description: item.description,
        sender_id: item.sender_id,
        receiver_id: item.receiver_id,
        listing_id: item.listing_id,
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
      };
    });
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
  static async getBasicProposalsSentByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: ListingOptionsDto,
  ): Promise<ProposalResponseDto[]> {
    const { data, error } = await supabase.rpc(
      'fetch_sent_basic_proposals_by_user',
      {
        p_user_id: userId,
        p_limit: options.limit,
        p_page: options.offset,
      },
    );

    if (error) {
      throw new HttpException(
        `Failed to fetch user sent proposals: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return [];
    }
    console.log('Dados na BD:');
    console.log(data);

    return (data as Proposal[]).map((item) => {
      return {
        proposal_id: item.proposal_id,
        title: item.title,
        description: item.description,
        sender_id: item.sender_id,
        sender_name: item.sender_name,
        receiver_id: item.receiver_id,
        listing_id: item.listing_id,
        listing_title: item.listing_title,
        proposal_type: item.proposal_type,
        proposal_status: item.proposal_status,
        created_at: item.created_at,
      };
    });
  }

  static async getBasicProposalDtosReceivedByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: ListingOptionsDto,
  ): Promise<ProposalResponseDto[]> {
    const { data, error } = await supabase.rpc(
      'fetch_received_basic_proposals_by_user',
      {
        p_user_id: userId,
        p_limit: options.limit,
        p_page: options.offset,
      },
    );

    if (error) {
      throw new HttpException(
        `Failed to fetch user received proposals: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!data) {
      return [];
    }
    console.log('Dados na BD:');
    console.log(data);

    return (data as ProposalResponseDto[]).map((item) => {
      return {
        proposal_id: item.proposal_id,
        title: item.title,
        description: item.description,
        sender_id: item.sender_id,
        sender_name: item.sender_name,
        receiver_id: item.receiver_id,
        listing_id: item.listing_id,
        listing_title: item.listing_title,
        proposal_type: item.proposal_type,
        proposal_status: item.proposal_status,
        created_at: item.created_at,
      };
    });
  }
  static async insertProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
  ): Promise<ProposalSimpleResponseDto> {
    const { data, error } = await supabase.rpc('create_proposal', {
      _current_user_id: dto.current_user_id,
      _title: dto.title,
      _description: dto.description,
      _listing_id: dto.listing_id,
      _proposal_type: dto.proposal_type,
      _proposal_status: dto.proposal_status,
      _offered_rent_per_day: dto.offered_rent_per_day,
      _start_date: dto.start_date,
      _end_date: dto.end_date,
      _offered_price: dto.offered_price,
      _swap_with: dto.swap_with,
      _message: dto.message,
      _target_username: dto.target_username,
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
    return {
      id: data.id,
      title: dto.title,
      description: dto.description,
    };
  }
}
