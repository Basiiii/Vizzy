import { SupabaseClient } from '@supabase/supabase-js';
import { Proposal } from '@/dtos/proposal/proposal.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalResponseDto } from '@/dtos/proposal/proposal-response.dto';

export class ProposalDatabaseHelper {
  static async getProposalsByUserId(
    supabase: SupabaseClient,
    userId: string,
    options: ListingOptionsDto,
  ): Promise<Proposal[]> {
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

    return (data as Proposal[]).map((item) => {
      return {
        proposal_id: item.proposal_id,
        title: item.title,
        description: item.description,
        sender_id: item.sender_id,
        receiver_id: item.receiver_id,
        listing_id: item.listing_id,
        proposal_type: item.proposal_type,
        proposal_status: item.proposal_status,
        swap_with: item.swap_with ?? null,
        offered_price: item.offered_price ?? null,
        message: item.message ?? null,
        offered_rent_per_day: item.offered_rent_per_day ?? null,
        start_date: item.start_date ?? null,
        end_date: item.end_date ?? null,
      };
    });
    }
  static async insertProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
  ): Promise<CreateProposalDto> {
    const { data: typeID, error: typeError } = await supabase
      .from('proposal_types')
      .select('id')
      .eq('description', dto.proposal_type)
      .single();
    if (typeError) {
      throw new Error(`Error fetching proposal type ID: ${typeError.message}`);
    }
    if (!typeID) {
      throw new Error('No proposal type ID found');
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        title: dto.title,
        description: dto.description,
        sender_id: dto.sender_id,
        receiver_id: dto.receiver_id,
        listing_id: dto.listing_id,
        proposal_type_id: typeID.id,
        proposal_status_id: null,
      })
      .select('id, title, description, sender_id, receiver_id, listing_id')
      .single();

    if (error) {
      throw new Error(`Error inserting proposal: ${error.message}`);
    }
    if (!data) {
      throw new Error('No data returned after proposal creation');
    }
    return {
      ...data,
      proposal_type: dto.proposal_type,
      proposal_status: dto.proposal_status,
    };
  }
  static async insertSwapProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    const { data, error } = await supabase
      .from('swap_proposals')
      .insert({
        id: dto.id,
        swap_with: dto.swap_with,
      })
      .select('id, swap_with')
      .single();

    if (error) {
      throw new Error(`Error inserting swap proposal: ${error.message}`);
    }
    if (!data) {
      throw new Error('No data returned after swap proposal creation');
    }
    return { id: data.id, title: dto.title, description: dto.description };
  }
  static async insertRentalProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    const { data, error } = await supabase
      .from('rental_proposals')
      .insert({
        id: dto.id,
        start_date: dto.start_date,
        end_date: dto.end_date,
        offered_rent_per_day: dto.offered_rent_per_day,
      })
      .select('id, start_date, end_date, offered_rent_per_day')
      .single();

    if (error) {
      throw new Error(`Error inserting rental proposal: ${error.message}`);
    }
    if (!data) {
      throw new Error('No data returned after rental proposal creation');
    }
    console.log('Rental proposal data:', data);
    return { id: data.id, title: dto.title, description: dto.description };
  }
  static async insertSaleProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
  ): Promise<ProposalResponseDto> {
    const { data, error } = await supabase
      .from('sale_proposals')
      .insert({
        id: dto.id,
        offered_price: dto.price,
      })
      .select('id, offered_price')
      .single();

    if (error) {
      throw new Error(`Error inserting sale proposal: ${error.message}`);
    }
    if (!data) {
      throw new Error('No data returned after sale proposal creation');
    }
    return { id: data.id, title: dto.title, description: dto.description };
  }
}
