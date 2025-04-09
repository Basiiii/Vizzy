import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object for contact deletion responses
 * Contains a success message to confirm deletion
 * Used when returning deletion confirmation to clients
 */
export class DeleteContactResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Contact deleted successfully',
  })
  message: string;
}
