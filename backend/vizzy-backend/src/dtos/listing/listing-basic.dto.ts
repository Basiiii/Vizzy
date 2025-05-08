import { ApiProperty } from '@nestjs/swagger';

export class ListingBasic {
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
    description: 'Type of listing',
    example: 'sale',
    enum: ['sale', 'rental', 'giveaway', 'swap'],
  })
  type: 'sale' | 'rental' | 'giveaway' | 'swap';

  @ApiProperty({
    description: 'Price of the listing (for sale listings)',
    example: '999.99',
    required: false,
  })
  price?: string;

  @ApiProperty({
    description: 'Price per day (for rental listings)',
    example: '49.99',
    required: false,
  })
  priceperday?: string;

  @ApiProperty({
    description: 'URL to the main image of the listing',
    example: 'https://example.com/images/iphone.jpg',
  })
  image_url: string;
}
