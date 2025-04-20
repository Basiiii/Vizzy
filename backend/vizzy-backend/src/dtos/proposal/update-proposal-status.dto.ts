import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { ProposalStatus } from '@/constants/proposal-status.enum';

/**
 * Schema definition for updating proposal status
 * @property {ProposalStatus} status - The new status value for the proposal
 * @throws {Error} When status value is not one of the valid ProposalStatus enum values
 */
const updateProposalStatusSchema = z.object({
  status: z.nativeEnum(ProposalStatus, {
    errorMap: () => ({
      message: `Status must be one of the following values: ${Object.values(ProposalStatus).join(', ')}`,
    }),
  }),
});

export { updateProposalStatusSchema };

/**
 * DTO for updating the status of a proposal.
 * Defines the shape for TypeScript/Swagger. Validation uses 'updateProposalStatusSchema'.
 */
export class UpdateProposalStatusDto {
  @ApiProperty({
    description: 'The new status for the proposal',
    enum: ProposalStatus,
    example: ProposalStatus.ACCEPTED,
  })
  status: ProposalStatus;
}
