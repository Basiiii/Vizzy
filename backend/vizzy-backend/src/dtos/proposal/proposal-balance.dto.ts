import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

/**
 * Schema definition for proposal balance validation
 * @remarks
 * Uses Zod for runtime type checking and validation
 */
export const proposalBalanceSchema = z.object({
  balance: z.number().int().min(0).describe('The number of active proposals'),
});

/**
 * Data Transfer Object (DTO) representing a user's proposal balance
 * @class
 */
export class ProposalBalanceDto {
  /**
   * The number of active proposals associated with the user
   * @property {number} balance - Must be a non-negative integer
   */
  @ApiProperty({
    description: 'The number of active proposals for the user.',
    example: 5,
    minimum: 0,
  })
  balance: number;
}
