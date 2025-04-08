import { z } from 'zod';

export const SaleProposalSchema = z.object({
  offer: z.number().min(-1, 'Offer must be a positive number'),
  description: z.string().optional(),
});

export type SaleProposalDto = z.infer<typeof SaleProposalSchema>;
