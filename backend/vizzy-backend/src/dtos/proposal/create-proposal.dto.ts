import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposalType } from '@/constants/proposal-types.enum';

/**
 * Base schema for all proposal types containing common fields
 * @property {string} title - The proposal title (1-100 characters)
 * @property {string} description - Detailed proposal description (1-1000 characters)
 * @property {number} listing_id - Positive integer ID of the related listing
 * @property {string} receiver_id - UUID of the proposal recipient
 * @property {string} [message] - Optional message (max 500 characters)
 */
const baseProposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description is too long'),
  listing_id: z
    .number()
    .int()
    .positive('Listing ID must be a positive integer'),
  receiver_id: z.string().uuid('Receiver ID must be a valid UUID'),
  message: z.string().max(500, 'Message is too long').optional(),
});

/**
 * Schema for rental proposals extending the base schema
 * @property {ProposalType} proposal_type - Must be RENTAL
 * @property {number} offered_rent_per_day - Positive number for daily rent
 * @property {Date} start_date - Rental start date
 * @property {Date} end_date - Rental end date
 */
const rentalProposalSchema = baseProposalSchema.extend({
  proposal_type: z.literal(ProposalType.RENTAL),
  offered_rent_per_day: z
    .number({ required_error: 'Rent offer is required for rental proposals' })
    .positive('Rent offer must be positive'),
  start_date: z.coerce.date({
    required_error: 'Start date is required for rental proposals',
  }),
  end_date: z.coerce.date({
    required_error: 'End date is required for rental proposals',
  }),
});

/**
 * Schema for sale proposals extending the base schema
 * @property {ProposalType} proposal_type - Must be SALE
 * @property {number} offered_price - Positive number for sale price
 */
const saleProposalSchema = baseProposalSchema.extend({
  proposal_type: z.literal(ProposalType.SALE),
  offered_price: z
    .number({ required_error: 'Price offer is required for sale proposals' })
    .positive('Price offer must be positive'),
});

/**
 * Schema for swap proposals extending the base schema
 * @property {ProposalType} proposal_type - Must be SWAP
 * @property {string} swap_with - Description of item offered for swap (1-200 characters)
 */
const swapProposalSchema = baseProposalSchema.extend({
  proposal_type: z.literal(ProposalType.SWAP),
  swap_with: z
    .string({ required_error: 'Swap details are required for swap proposals' })
    .min(1)
    .max(200),
});

/**
 * Schema for giveaway proposals extending the base schema
 * @property {ProposalType} proposal_type - Must be GIVEAWAY
 */
const giveawayProposalSchema = baseProposalSchema.extend({
  proposal_type: z.literal(ProposalType.GIVEAWAY),
});

/**
 * Combined schema using discriminated union for all proposal types
 * Includes validation for proposal type and rental date range
 * @type {z.ZodType}
 */
const createProposalSchema = z
  .discriminatedUnion(
    'proposal_type',
    [
      rentalProposalSchema,
      saleProposalSchema,
      swapProposalSchema,
      giveawayProposalSchema,
    ],
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
          return {
            message: `Invalid proposal type. Must be one of: ${Object.values(ProposalType).join(', ')}`,
          };
        }
        return { message: ctx.defaultError };
      },
    },
  )
  .refine(
    (data) => {
      if (data.proposal_type === ProposalType.RENTAL) {
        return data.end_date > data.start_date;
      }
      return true; // No cross-field validation needed for other types
    },
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    },
  );

/**
 * DTO for creating a new proposal.
 * Uses a Zod discriminated union for validation based on proposal_type.
 * The class definition includes all possible fields as optional;
 * the Zod schema enforces conditional requirements at runtime.
 */
export { createProposalSchema };

/**
 * DTO for creating a new proposal.
 * Defines the shape of the incoming request body for TypeScript and Swagger.
 * Validation is performed separately using the 'createProposalSchema' by ZodValidationPipe.
 */
export class CreateProposalDto {
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
    example: 123,
  })
  listing_id: number;

  @ApiProperty({
    description: 'Type of the proposal (determines required fields)',
    enum: ProposalType,
    example: ProposalType.RENTAL,
  })
  proposal_type: ProposalType;

  @ApiProperty({
    description: 'User ID of the proposal recipient',
    example: 'user-uuid-recipient-123',
  })
  receiver_id: string;

  @ApiPropertyOptional({
    description: 'Optional message included with the proposal',
    example: 'Please let me know if this works for you.',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Offered rent amount per day (Required for RENTAL proposals)',
    example: 50.0,
  })
  offered_rent_per_day?: number;

  @ApiPropertyOptional({
    description:
      'Proposed start date for rental (Required for RENTAL proposals)',
    type: String,
    format: 'date-time',
    example: '2024-08-15T09:00:00Z',
  })
  start_date?: Date;

  @ApiPropertyOptional({
    description: 'Proposed end date for rental (Required for RENTAL proposals)',
    type: String,
    format: 'date-time',
    example: '2024-08-18T18:00:00Z',
  })
  end_date?: Date;

  @ApiPropertyOptional({
    description: 'Offered price (Required for SALE proposals)',
    example: 850.0,
  })
  offered_price?: number;

  @ApiPropertyOptional({
    description:
      'Details of the item offered for swap (Required for SWAP proposals)',
    example: 'My mint condition Sony A7 III',
  })
  swap_with?: string;
}
