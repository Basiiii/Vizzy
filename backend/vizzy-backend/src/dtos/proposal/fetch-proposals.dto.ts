import { z } from 'zod';

export const fetchProposalsSchema = z.object({
  userId: z.string().uuid(),
  limit: z.coerce.number().int().positive(),
  offset: z.coerce.number().int().positive(),

  received: z.coerce.boolean().optional().default(false),
  sent: z.coerce.boolean().optional().default(false),
  accepted: z.coerce.boolean().optional().default(false),
  rejected: z.coerce.boolean().optional().default(false),
  canceled: z.coerce.boolean().optional().default(false),
});

export type FetchProposalsDto = z.infer<typeof fetchProposalsSchema>;
