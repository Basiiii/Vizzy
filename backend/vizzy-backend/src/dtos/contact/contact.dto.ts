import { ApiProperty } from '@nestjs/swagger';

/**
 * Base contact data transfer object
 * Contains common properties shared by all contact-related DTOs
 */
export class Contact {
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
