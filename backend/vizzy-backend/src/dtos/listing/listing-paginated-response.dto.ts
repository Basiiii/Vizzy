import { ApiProperty } from '@nestjs/swagger';
import { ListingBasic } from './listing-basic.dto';

export class ListingPaginatedResponse {
  @ApiProperty({
    description: 'Array of listings',
    type: [ListingBasic],
  })
  listings: ListingBasic[];

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;
}
