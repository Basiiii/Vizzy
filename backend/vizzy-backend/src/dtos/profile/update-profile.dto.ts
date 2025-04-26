import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Zod schema for validating profile update data
 * Defines validation rules for each field that can be updated
 */
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  username: z.string().min(3).max(20).nullable().optional(),
});

/**
 * Data transfer object for updating an existing profile
 * All fields are optional since updates may modify only some fields
 * Uses Zod for validation via nestjs-zod integration
 */
export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
    nullable: true,
  })
  name?: string | null;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    required: false,
    nullable: true,
  })
  email?: string | null;

  @ApiProperty({
    description: 'Username for the account',
    example: 'johndoe',
    required: false,
    nullable: true,
  })
  username?: string | null;
}
