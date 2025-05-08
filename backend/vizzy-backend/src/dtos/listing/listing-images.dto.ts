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
    type: 'array',
    items: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        url: { type: 'string' },
      },
    },
  })
  images: { path: string; url: string }[];
}

export class ImageOperationDto {
  @ApiProperty({
    description:
      'Array of image paths to delete. If empty, no images will be deleted. If ["*"], all images will be deleted.',
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  imagesToDelete?: string[];
}

export class UpdateListingImagesDto {
  @ApiProperty({
    description: 'Array of image paths to delete',
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  imagesToDelete?: string[];

  @ApiProperty({
    description: 'New order of image paths',
    type: 'array',
    items: { type: 'string' },
    required: false,
  })
  imageOrder?: string[];

  @ApiProperty({
    description: 'Path of the image to set as main image',
    type: 'string',
    required: false,
  })
  mainImage?: string;
}
