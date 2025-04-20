import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.dto';

/**
 * Represents the response structure for successful authentication operations (login, signup, refresh).
 * Contains the authenticated user's details and the JWT tokens.
 */
export class AuthResponseDto {
  @ApiProperty({
    description: "The authenticated user's information.",
    type: () => User,
  })
  user: User;

  @ApiProperty({
    description: 'The JWT access and refresh tokens.',
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      refreshToken: { type: 'string', example: 'v2.refreshtoken...' },
    },
  })
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
