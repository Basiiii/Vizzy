import { z } from 'zod';

export const PurchaseProposalSchema = z.object({
  offer: z.number().min(0, 'Offer must be a positive number'),
  description: z.string().optional(),
});

export type PurchaseProposalDto = z.infer<typeof PurchaseProposalSchema>;
