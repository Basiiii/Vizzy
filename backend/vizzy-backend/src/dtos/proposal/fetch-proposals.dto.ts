import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Default page number for pagination
 */
const DEFAULT_PAGE = 1;

/**
 * Default number of items per page
 */
const DEFAULT_LIMIT = 8;

/**
 * Schema definition for fetching proposals with filtering and pagination options
 * @remarks
 * This schema uses Zod for validation and type checking of query parameters
 */
export const fetchProposalsSchema = z.object({
  /**
   * Page number for pagination, must be a positive integer
   * @default 1
   */
  page: z.coerce.number().int().positive().optional().default(DEFAULT_PAGE),

  /**
   * Number of items per page, must be a positive integer
   * @default 8
   */
  limit: z.coerce.number().int().positive().optional().default(DEFAULT_LIMIT),

  /**
   * Filter for proposals received by the user
   * @default false
   */
  received: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional().default(false),
  ),

  /**
   * Filter for proposals sent by the user
   * @default false
   */
  sent: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional().default(false),
  ),

  /**
   * Filter for accepted proposals
   * @default false
   */
  accepted: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional().default(false),
  ),

  /**
   * Filter for rejected proposals
   * @default false
   */
  rejected: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional().default(false),
  ),

  /**
   * Filter for cancelled proposals
   * @default false
   */
  cancelled: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional().default(false),
  ),

  /**
   * Filter for pending proposals
   * @default false
   */
  pending: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional().default(false),
  ),
});

export type FetchProposalsQueryType = z.infer<typeof fetchProposalsSchema>;

/**
 * DTO for query parameters used when fetching a list of proposals.
 * Defines pagination and filtering options.
 * Uses Zod for validation and default values.
 */
export class FetchProposalsDto extends createZodDto(fetchProposalsSchema) {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: DEFAULT_PAGE,
    type: Number,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: DEFAULT_LIMIT,
    type: Number,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter for proposals received by the user',
    default: false,
    type: Boolean,
  })
  received?: boolean;

  @ApiPropertyOptional({
    description: 'Filter for proposals sent by the user',
    default: false,
    type: Boolean,
  })
  sent?: boolean;

  @ApiPropertyOptional({
    description: 'Filter for accepted proposals',
    default: false,
    type: Boolean,
  })
  accepted?: boolean;

  @ApiPropertyOptional({
    description: 'Filter for rejected proposals',
    default: false,
    type: Boolean,
  })
  rejected?: boolean;

  @ApiPropertyOptional({
    description: 'Filter for cancelled proposals',
    default: false,
    type: Boolean,
  })
  cancelled?: boolean;

  @ApiPropertyOptional({
    description: 'Filter for pending proposals',
    default: false,
    type: Boolean,
  })
  pending?: boolean;
}
