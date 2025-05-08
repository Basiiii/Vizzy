import { ProposalStatus } from '@/constants/proposal-status.enum';
import { ProposalType } from '@/constants/proposal-types.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
/**
 * Represents the detailed response data for a single proposal.
 */
export class ProposalResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the proposal',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'Title of the proposal',
    example: 'Offer for Renting Camera Gear',
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the proposal',
    example: 'I would like to rent your Canon R5 for the weekend.',
  })
  description: string;

  @ApiProperty({
    description: 'ID of the listing the proposal is related to',
    example: 456,
  })
  listing_id: number;

  @ApiProperty({
    description: 'Title of the related listing',
    example: 'Canon R5 Camera Body',
  })
  listing_title: string;

  @ApiProperty({
    description: 'Type of the proposal',
    enum: ProposalType,
    example: ProposalType.RENTAL,
  })
  proposal_type: ProposalType;

  @ApiProperty({
    description: 'Current status of the proposal',
    enum: ProposalStatus,
    example: ProposalStatus.PENDING,
  })
  proposal_status: ProposalStatus;

  @ApiProperty({
    description: 'User ID of the sender',
    example: 'user-uuid-sender-456',
  })
  sender_id: string;

  @ApiProperty({
    description: 'The real name of the sender',
    example: 'John Doe',
  })
  sender_name: string;

  @ApiProperty({
    description: 'User ID of the recipient',
    example: 'user-uuid-recipient-123',
  })
  receiver_id: string;

  @ApiProperty({
    description: 'The real name of the receiver',
    example: 'Jane Doe',
  })
  receiver_name: string;

  @ApiProperty({
    description: 'Timestamp when the proposal was created',
    type: String,
    format: 'date-time',
  })
  created_at: Date;

  @ApiPropertyOptional({
    description: 'Optional message included with the proposal',
    example: 'Please let me know if this works for you.',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Offered rent amount per day (for rental proposals)',
    example: 50.0,
  })
  offered_rent_per_day?: number;

  @ApiPropertyOptional({
    description: 'Proposed start date for rental',
    type: String,
    format: 'date-time',
    example: '2024-08-15T09:00:00Z',
  })
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'Proposed end date for rental',
    type: String,
    format: 'date-time',
    example: '2024-08-18T18:00:00Z',
  })
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'Offered price (for sale proposals)',
    example: 850.0,
  })
  offered_price?: number;

  @ApiPropertyOptional({
    description: 'Details of the item offered for swap (for swap proposals)',
    example: 'My mint condition Sony A7 III',
  })
  swap_with?: string;
}

/**
 * Response DTO for endpoints returning a list of proposals with pagination/count info.
 */
export class ProposalsWithCountDto {
  @ApiProperty({
    description: 'List of proposals matching the query',
    type: [ProposalResponseDto],
  })
  proposals: ProposalResponseDto[];

  @ApiProperty({
    description:
      'Total number of proposals available matching the query (for pagination)',
    example: 50,
  })
  totalProposals: number; // TODO: update this to return `total_proposals` in api
}
