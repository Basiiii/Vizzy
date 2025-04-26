import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema for creating a favorite.
 * Only requires listing_id and title.
 */
const createFavoriteSchema = z.object({
  listing_id: z
    .number()
    .int()
    .positive('Listing ID must be a positive integer'),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
});

export { createFavoriteSchema };

/**
 * DTO for creating a favorite.
 * Defines the shape of the incoming request body.
 */
export class CreateFavoriteDto {
  @ApiProperty({
    description: 'ID of the listing to be marked as favorite',
    example: 123,
  })
  listing_id: number;

  @ApiProperty({
    description: 'Title of the listing',
    example: 'Canon EOS R5 for Rent',
  })
  title: string;
}
