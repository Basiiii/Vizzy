import { SupabaseClient } from '@supabase/supabase-js';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ProposalResponseDto,
  ProposalsWithCountDto,
} from '@/dtos/proposal/proposal-response.dto';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalStatus } from '@/constants/proposal-status.enum';
import { ProposalType } from '@/constants/proposal-types.enum';
import {
  CreateProposalReturn,
  FetchFilteredProposalsArgs,
  FetchProposalsOptions,
  RawProposalListData,
  RawSingleProposalData,
} from './proposal-database.types';
//import { RentalAvailabilityDto } from '@/dtos/listing/rental-availability.dto';

export class ProposalDatabaseHelper {
  private static mapRawToProposalDto(
    item: RawProposalListData | RawSingleProposalData,
  ): ProposalResponseDto {
    return {
      id: item.proposal_id,
      title: item.title,
      description: item.description,
      sender_id: item.sender_id,
      sender_name: item.sender_name,
      receiver_id: item.receiver_id,
      receiver_name: item.receiver_name,
      sender_username: item.sender_username,
      receiver_username: item.receiver_username,
      listing_id: item.listing_id,
      listing_title: item.listing_title,
      proposal_type: item.proposal_type as ProposalType,
      proposal_status: item.proposal_status as ProposalStatus,
      created_at: new Date(item.created_at),
      swap_with: item.swap_with ?? null,
      offered_price: item.offered_price ?? null,
      message: item.message ?? null,
      offered_rent_per_day: item.offered_rent_per_day ?? null,
      start_date: item.start_date ? new Date(item.start_date) : null,
      end_date: item.end_date ? new Date(item.end_date) : null,
    };
  }

  static async fetchBasicProposalsByFilters(
    supabase: SupabaseClient,
    userId: string,
    options: FetchProposalsOptions,
  ): Promise<ProposalsWithCountDto> {
    const rpcArgs: FetchFilteredProposalsArgs = {
      user_id: userId,
      fetch_limit: options.limit,
      fetch_page: options.page,
      received: options.received ?? false,
      sent: options.sent ?? false,
      accepted: options.accepted ?? false,
      rejected: options.rejected ?? false,
      cancelled: options.cancelled ?? false,
      pending: options.pending ?? false,
    };

    const { data, error } = await supabase.rpc(
      'fetch_filtered_proposals',
      rpcArgs,
    );

    if (error) {
      throw new HttpException(
        `Failed to fetch filtered proposals: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const rawData = data as RawProposalListData[];

    if (!rawData || rawData.length === 0) {
      return { proposals: [], totalProposals: 0 };
    }

    const proposals = rawData.map((item) =>
      ProposalDatabaseHelper.mapRawToProposalDto(item),
    );

    const totalProposals = rawData[0]?.total_count
      ? Number(rawData[0].total_count)
      : 0;

    return { proposals, totalProposals };
  }

  static async getProposalDataById(
    supabase: SupabaseClient,
    proposalId: number,
  ): Promise<ProposalResponseDto | null> {
    const { data, error } = await supabase.rpc('get_proposal_json', {
      proposal_id: proposalId,
    });

    // TODO: atualizar funções na BD para ser em inglês
    if (error) {
      if (error.code === 'P0001' && error.message.includes('not found')) {
        return null;
      }
      throw new HttpException(
        `Failed to fetch proposal data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const rawData = data as RawSingleProposalData;
    return rawData ? ProposalDatabaseHelper.mapRawToProposalDto(rawData) : null;
  }

  static async insertProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
    sender_id: string,
  ): Promise<{ id: number }> {
    const { data, error } = await supabase.rpc('create_proposal', {
      title: dto.title,
      description: dto.description,
      listing_id: dto.listing_id,
      proposal_type: dto.proposal_type,
      proposal_status: ProposalStatus.PENDING,
      sender_id: sender_id,
      receiver_id: dto.receiver_id,
      offered_price: dto.offered_price ?? null,
      offered_rent_per_day: dto.offered_rent_per_day ?? null,
      start_date: dto.start_date ? dto.start_date.toISOString() : null,
      end_date: dto.end_date ? dto.end_date.toISOString() : null,
      message: dto.message ?? null,
      swap_with: dto.swap_with ?? null,
    });

    if (error) {
      throw new HttpException(
        `Failed to insert proposal: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const resultData = data as CreateProposalReturn;
    return { id: resultData.id };
  }

  static async updateProposalStatus(
    supabase: SupabaseClient,
    proposalId: number,
    status: ProposalStatus,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase.rpc('update_proposal_status', {
      proposal_id: proposalId,
      new_status: status,
      user_id: userId,
    });
    if (error) {
      if (error.code === 'P0001') {
        if (error.message.includes('User not authorized')) {
          throw new HttpException(error.message, HttpStatus.FORBIDDEN);
        } else if (
          error.message.includes('Invalid status') ||
          error.message.includes('Proposal not found')
        ) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }
      throw new HttpException(
        `Failed to update proposal status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  static async getProposalMetadata(
    supabase: SupabaseClient,
    proposalId: number,
  ): Promise<{ sender_id: string; receiver_id: string } | null> {
    const { data, error } = await supabase
      .from('proposals')
      .select('sender_id, receiver_id')
      .eq('id', proposalId)
      .maybeSingle();

    if (error) {
      throw new HttpException(
        `Database error fetching proposal metadata: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data;
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

    if (typeof data !== 'number') {
      throw new HttpException(
        'Invalid balance data received',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data;
  }
  /*   static async createRentalAvailability(
    supabase: SupabaseClient,
    rentalAvailability: RentalAvailabilityDto,
  ): Promise<void> {
    const { error } = await supabase
      .from('rental_availability')
      .insert(rentalAvailability);
    if (error) {
      throw new HttpException(
        `Failed to create rental availability: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  } */
}
