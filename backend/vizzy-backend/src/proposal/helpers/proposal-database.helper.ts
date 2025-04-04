import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
import { ProposalResponseDto } from '@/dtos/proposal/proposal-response.dto';
export class ProposalDatabaseHelper {
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
