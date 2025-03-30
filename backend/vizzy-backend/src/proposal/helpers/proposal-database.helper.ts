import { SupabaseClient } from '@supabase/supabase-js';
import { Proposal } from '@/dtos/proposal/proposal.dto';
import { ListingOptionsDto } from '@/dtos/listing/listing-options.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

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
}
