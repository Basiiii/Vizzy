import { ApiProperty } from '@nestjs/swagger';

export class ListingImageDto {
  @ApiProperty({
    description: 'Path to the image in storage',
    example: 'listing-123/image1.jpg',
  })
  path: string;

  @ApiProperty({
    description: 'Public URL to access the image',
    example:
      'https://example.com/storage/v1/object/public/listings/listing-123/image1.jpg',
  })
  url: string;
}

export class ListingImagesResponseDto {
  @ApiProperty({
    description: 'Array of listing images',
    type: [ListingImageDto],
  })
  images: ListingImageDto[];
}
