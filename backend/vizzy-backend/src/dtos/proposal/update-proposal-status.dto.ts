import { ApiProperty } from '@nestjs/swagger';
import { ProposalStatus } from '@/constants/proposal-status.enum';

/**
 * Data Transfer Object (DTO) for updating the status of a proposal
 * @class UpdateProposalStatusDto
 */
export class UpdateProposalStatusDto {
  @ApiProperty({
    description: 'The new status for the proposal',
    enum: ProposalStatus,
    example: ProposalStatus.ACCEPTED,
  })
  status: string;
}
