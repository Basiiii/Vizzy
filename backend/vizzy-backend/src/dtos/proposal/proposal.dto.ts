import { z } from 'zod';

// Base Proposal Schema (includes common fields)
const BaseProposalSchema = z.object({
  proposalType: z.enum(['Rental', 'Sale', 'Swap']),
});

// Rental Proposal Schema (Fix using `.superRefine()` instead of `.refine()`)
const RentalProposalSchema = BaseProposalSchema.extend({
  proposalType: z.literal('Rental'),
  offer: z.number().min(0, 'Offer must be a positive number'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Start date must be a valid date',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'End date must be a valid date',
  }),
  message: z.string().optional(),
});

// Sale Proposal Schema
const SaleProposalSchema = BaseProposalSchema.extend({
  proposalType: z.literal('Sale'),
  offer: z.number().min(0, 'Offer must be a positive number'),
  description: z.string().optional(),
});

// Swap Proposal Schema
const SwapProposalSchema = BaseProposalSchema.extend({
  proposalType: z.literal('Swap'),
  description: z.string().min(1, 'Description is required'),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']),
});

// Combined Proposal Schema (Union of all types)
export const ProposalSchema = z.discriminatedUnion('proposalType', [
  RentalProposalSchema,
  SaleProposalSchema,
  SwapProposalSchema,
]);

// export type ProposalDto = z.infer<typeof ProposalSchema>;

export interface Proposal {
  id?: string;
  title: string;
  description: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  proposal_type: string;
  proposal_status: string;
  created_at?: Date;
  sender_name?: string;
  receiver_name?: string;
  listing_title?: string;
  offered_rent_per_day?: number;
  start_date?: Date;
  end_date?: Date;
  offered_price?: number;
  swap_with?: string;
  message?: string;
}

export interface BasicProposalDto {
  title: string;
  description: string;
}
