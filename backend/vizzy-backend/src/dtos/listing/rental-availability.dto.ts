import { ApiProperty } from '@nestjs/swagger';

export class RentalAvailabilityDto {
  @ApiProperty({
    description: 'Start date of the rental period',
    type: String,
    format: 'date-time',
    example: '2024-03-15T00:00:00Z',
  })
  start_date: string;

  @ApiProperty({
    description: 'End date of the rental period',
    type: String,
    format: 'date-time',
    example: '2024-03-20T00:00:00Z',
  })
  end_date: string;
}
