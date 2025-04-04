import { z } from 'zod';

// Base Proposal Schema (includes common fields)
const BaseProposalSchema = z.object({
  proposalType: z.enum(['rental', 'purchase', 'swap']),
});

// Rental Proposal Schema (Fix using `.superRefine()` instead of `.refine()`)
const RentalProposalSchema = BaseProposalSchema.extend({
  proposalType: z.literal('rental'),
  offer: z.number().min(0, 'Offer must be a positive number'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Start date must be a valid date',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'End date must be a valid date',
  }),
  message: z.string().optional(),
});

// Purchase Proposal Schema
const PurchaseProposalSchema = BaseProposalSchema.extend({
  proposalType: z.literal('purchase'),
  offer: z.number().min(0, 'Offer must be a positive number'),
  description: z.string().optional(),
});

// Swap Proposal Schema
const SwapProposalSchema = BaseProposalSchema.extend({
  proposalType: z.literal('swap'),
  description: z.string().min(1, 'Description is required'),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']),
});

// Combined Proposal Schema (Union of all types)
export const ProposalSchema = z.discriminatedUnion('proposalType', [
  RentalProposalSchema,
  PurchaseProposalSchema,
  SwapProposalSchema,
]);

export type ProposalDto = z.infer<typeof ProposalSchema>;

export interface Proposal {
  proposal_id: number;
  title: string;
  description: string;
  sender_id: string;
  receiver_id: string;
  listing_id: number;
  proposal_type: string;
  proposal_status: string;
  offered_rent_per_day?: number;
  start_date?: Date;
  end_date?: Date;
  offered_price?: number;
  swap_with?: string;
  message?: string;
}
export interface Proposal {
  title: string;
  description: string;
}
