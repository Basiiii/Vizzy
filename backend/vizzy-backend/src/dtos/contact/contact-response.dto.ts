import { ApiProperty } from '@nestjs/swagger';
import { Contact } from './contact.dto';

/**
 * Data transfer object for contact responses
 * Extends the base Contact class with an ID field
 * Used when returning contact data to clients
 */
export class ContactResponseDto extends Contact {
  @ApiProperty({
    description: 'Unique identifier for the contact',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
