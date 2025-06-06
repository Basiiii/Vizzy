import { ApiProperty } from '@nestjs/swagger';
import { ListingType } from './listing.dto';
import { ProductCondition } from './sale-listing.dto';

export class CreateListingDto {
  @ApiProperty({
    description: 'Title of the listing',
    example: 'iPhone 12 Pro Max',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the listing',
    example: 'Brand new iPhone 12 Pro Max, 256GB, Pacific Blue',
  })
  description: string;

  @ApiProperty({
    description: 'Category of the listing',
    example: 'electronics',
  })
  category: string;

  @ApiProperty({
    description: 'Type of listing',
    example: 'sale',
    enum: ['sale', 'rental', 'giveaway', 'swap'],
  })
  listing_type: ListingType;

  @ApiProperty({
    description: 'Condition of the product (for sale listings)',
    example: 'New',
    enum: ['New', 'Like New', 'Good', 'Fair', 'Very Good'],
    required: false,
  })
  product_condition?: ProductCondition;

  @ApiProperty({
    description: 'Price of the listing (for sale listings)',
    example: 999.99,
    required: false,
  })
  price?: number;

  @ApiProperty({
    description: 'Whether the price is negotiable (for sale listings)',
    example: true,
    required: false,
  })
  is_negotiable?: boolean;

  @ApiProperty({
    description: 'Whether a deposit is required (for rental listings)',
    example: true,
    required: false,
  })
  deposit_required?: boolean;

  @ApiProperty({
    description: 'The value of the deposit (for rental listings)',
    example: 50.0,
    required: false,
  })
  deposit_value?: number;

  @ApiProperty({
    description: 'Cost per day (for rental listings)',
    example: 49.99,
    required: false,
  })
  cost_per_day?: number;

  @ApiProperty({
    description: 'Date when the rental listing should automatically close',
    example: '2023-12-31T23:59:59Z',
    required: false,
  })
  auto_close_date?: Date;

  @ApiProperty({
    description: 'Maximum rental duration in days (for rental listings)',
    example: 30,
    required: false,
  })
  rental_duration_limit?: number;

  @ApiProperty({
    description: 'Late fee amount (for rental listings)',
    example: 10.0,
    required: false,
  })
  late_fee?: number;

  @ApiProperty({
    description: 'Description of desired item for swap (for swap listings)',
    example: 'Looking for a MacBook Pro',
    required: false,
  })
  desired_item?: string;
  @ApiProperty({
    description: 'Description of requirements for giveway listings',
    example: 'Should live 1 km away at maximum',
    required: false,
  })
  recipient_requirements?: string;
}
