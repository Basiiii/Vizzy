import { z } from 'zod';

export const SwapProposalSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']),
});

export type SwapProposalDto = z.infer<typeof SwapProposalSchema>;
