import { ApiProperty } from '@nestjs/swagger';
import { Contact } from './contact.dto';

/**
 * Data transfer object for creating a new contact
 * Implements the Contact interface to ensure all required fields are present
 * Used when receiving contact creation requests from clients
 */
export class CreateContactDto implements Contact {
  @ApiProperty({
    description: 'Name of the contact',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the contact',
    example: 'Primary business contact',
  })
  description: string;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '+351999888777',
  })
  phone_number: string;
}
