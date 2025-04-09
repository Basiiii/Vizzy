import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Zod schema for validating contact update data
 * Defines validation rules for each field that can be updated
 */
export const updateContactSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone_number: z.string().min(1).max(20).optional(),
  description: z.string().max(500).optional(),
});

/**
 * Data transfer object for updating an existing contact
 * All fields are optional since updates may modify only some fields
 * Uses Zod for validation via nestjs-zod integration
 */
export class UpdateContactDto extends createZodDto(updateContactSchema) {
  @ApiProperty({
    description: 'Name of the contact',
    example: 'John Doe',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '+1234567890',
    required: false,
  })
  phone_number?: string;

  @ApiProperty({
    description: 'Description of the contact',
    example: 'Primary business contact',
    required: false,
  })
  description?: string;
}
