import { z } from 'zod';

// Common fields
const baseFields = {
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
};

// Sale schema
const saleSchema = z.object({
  listingType: z.literal('sale'),
  ...baseFields,
  price: z.number().min(0, 'Price must be a positive number'),
  productCondition: z.enum(['new', 'likeNew', 'fair', 'poor']),
  negotiable: z.boolean().default(false),
});

// Rental schema
const rentalSchema = z
  .object({
    listingType: z.literal('rental'),
    ...baseFields,
    costPerDay: z.number().min(0, 'Cost per day must be a positive number'),
    depositRequired: z.boolean().default(false),
    depositAmount: z.number().min(0),
    enableRentalDurationLimit: z.boolean().default(false),
    rentalDurationLimit: z.number().min(1).optional(),
    enableLateFee: z.boolean().default(false),
    lateFee: z.number().min(0.01).optional(),
    enableAutoClose: z.boolean().default(false),
    autoCloseDate: z.date().nullable(),
  })
  .refine((data) => !data.enableAutoClose || data.autoCloseDate !== null, {
    message: 'Auto close date is required when enabled',
    path: ['autoCloseDate'],
  })
  .refine(
    (data) =>
      !data.enableRentalDurationLimit || (data.rentalDurationLimit ?? 0) > 0,
    {
      message: 'Duration limit is required when enabled',
      path: ['rentalDurationLimit'],
    },
  )
  .refine((data) => !data.enableLateFee || (data.lateFee ?? 0) > 0, {
    message: 'Late fee is required when enabled',
    path: ['lateFee'],
  });

// Giveaway schema
const giveawaySchema = z.object({
  listingType: z.literal('giveaway'),
  ...baseFields,
  recipientRequirements: z.string().optional(),
});

// Swap schema
const swapSchema = z.object({
  listingType: z.literal('swap'),
  ...baseFields,
  swapInterest: z
    .string()
    .min(5, "Please describe what you're interested in swapping for"),
});

// Use z.union instead of discriminatedUnion
export const listingSchema = z.union([
  saleSchema,
  rentalSchema,
  giveawaySchema,
  swapSchema,
]);

export type ListingFormValues = z.infer<typeof listingSchema>;
