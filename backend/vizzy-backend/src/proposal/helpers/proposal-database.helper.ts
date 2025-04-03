import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProposalDto } from '@/dtos/proposal/create-proposal.dto';
//import { ProposalResponseDto } from '@/dtos/proposal/proposal-response.dto';
export class ProposalDatabaseHelper {
  static async insertProposal(
    supabase: SupabaseClient,
    dto: CreateProposalDto,
  ): Promise<CreateProposalDto> {
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        title: dto.title,
        description: dto.description,
        sender_id: dto.sender_id,
        receiver_id: dto.receiver_id,
        listing_id: dto.listing_id,
        proposal_type: dto.proposal_type,
        proposal_status: dto.proposal_status,
      })
      .select(
        'id, title, description, sender_id, receiver_id, listing_id, proposal_type, proposal_status',
      )
      .single();

    if (error) {
      throw new Error(`Error inserting proposal: ${error.message}`);
    }
    if (!data) {
      throw new Error('No data returned after proposal creation');
    }
    return data;
  }
}
