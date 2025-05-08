import { ApiProperty } from '@nestjs/swagger';

export class UserLocationDto {
  @ApiProperty({
    description: 'Id of the user location',
    example: '32',
  })
  id: string;

  @ApiProperty({
    description: 'Full address of the user location',
    example: '',
  })
  full_address: string;

  @ApiProperty({
    description: 'Latitude coordinate of the user location',
    example: 37.4224764,
  })
  lat: number;

  @ApiProperty({
    description: 'Longitude coordinate of the user location',
    example: -122.0842499,
  })
  lon: number;

  @ApiProperty({
    description: 'Timestamp of when the user location was created',
    example: '2023-06-19T12:00:00Z',
  })
  created_at: Date;
}
