// import { z } from 'zod';

// export const RentalProposalSchema = z
//   .object({
//     offer: z.number().min(0, 'Offer must be a positive number'),
//     startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
//       message: 'Start date must be a valid date',
//     }),
//     endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
//       message: 'End date must be a valid date',
//     }),
//     message: z.string().optional(),
//   })
//   .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
//     message: 'End date must be after start date',
//     path: ['endDate'],
//   });

// export type RentalProposalDto = z.infer<typeof RentalProposalSchema>;
