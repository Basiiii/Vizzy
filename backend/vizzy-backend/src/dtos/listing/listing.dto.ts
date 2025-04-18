import { ApiProperty } from '@nestjs/swagger';

export type ListingType = 'sale' | 'rental' | 'giveaway' | 'swap';
export type ListingStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'sold'
  | 'rented';

export class Listing {
  @ApiProperty({
    description: 'Unique identifier for the listing',
    example: 'listing-123',
  })
  id: string;

  @ApiProperty({
    description: 'Title of the listing',
    example: 'iPhone 12 Pro Max',
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the listing',
    example: 'Brand new iPhone 12 Pro Max, 256GB, Pacific Blue',
  })
  description: string;

  @ApiProperty({
    description: 'Date when the listing was created',
    example: '2023-01-01T12:00:00Z',
  })
  date_created: string;

  @ApiProperty({
    description: 'ID of the user who owns the listing',
    example: 'user-123',
  })
  owner_id: string;

  @ApiProperty({
    description: 'ID of the category the listing belongs to',
    example: 'category-electronics',
  })
  category_id: string;

  @ApiProperty({
    description: 'Current status of the listing',
    example: 'active',
    enum: ['active', 'inactive', 'pending', 'sold', 'rented'],
  })
  listing_status: ListingStatus;

  @ApiProperty({
    description: 'Type of the listing',
    example: 'sale',
    enum: ['sale', 'rental', 'giveaway', 'swap'],
  })
  listing_type: ListingType;

  @ApiProperty({
    description: 'URL to the main image of the listing',
    example: 'https://example.com/images/iphone.jpg',
  })
  image_url: string;
}

export class UpdateImageUrlDto {
  @ApiProperty({ description: 'The URL of the main image' })
  imageUrl: string;
}
