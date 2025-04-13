import { ApiProperty } from '@nestjs/swagger';

/**
 * User information data transfer object
 */
class UserInfo {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'user-123',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Username for the account',
    example: 'johndoe',
  })
  username: string;
}

/**
 * Data transfer object for profile verification responses
 * Contains verification status and user information
 */
export class ProfileVerificationDto {
  @ApiProperty({
    description: 'Verification status',
    example: true,
  })
  ok: boolean;

  @ApiProperty({
    description: 'User information',
    type: UserInfo,
  })
  user: UserInfo;
}
