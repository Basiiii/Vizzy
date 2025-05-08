import { ApiProperty } from '@nestjs/swagger';

/**
 * Base profile data transfer object
 * Contains common properties shared by all profile-related DTOs
 */
export class Profile {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'user-123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Location of the user',
    example: 'New York, USA',
  })
  location: string;

  @ApiProperty({
    description: "URL to the user's avatar image",
    example: 'https://example.com/avatars/user-123.jpg',
  })
  avatarUrl: string;

  @ApiProperty({
    description: 'Verification status of the user',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Year when the user joined',
    example: 2023,
  })
  memberSince: number;

  @ApiProperty({
    description: 'Number of active listings by the user',
    example: 5,
  })
  activeListings: number;

  @ApiProperty({
    description: 'Total number of completed sales',
    example: 10,
  })
  totalSales: number;
}
