import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'Max123',
  })
  username: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'Max Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'max.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Indicates if the user has been deleted',
    example: false,
    default: false,
  })
  is_deleted: boolean = false;

  @ApiProperty({
    description: 'The date when the user was deleted',
    example: null,
    required: false,
    nullable: true,
    default: null,
  })
  deleted_at?: Date | null = null;
}
