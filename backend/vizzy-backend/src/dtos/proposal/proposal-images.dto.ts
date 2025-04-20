import { ApiProperty } from '@nestjs/swagger';

/**
 * Represents a single image associated with a proposal.
 */
export class ProposalImageDto {
  @ApiProperty({
    description: 'Storage path of the image file',
    example: '123/image_abc.webp',
  })
  path: string;

  @ApiProperty({
    description: 'Publicly accessible URL for the image',
    example:
      'https://your-supabase-url/storage/v1/object/public/proposals/123/image_abc.webp',
  })
  url: string;
}

/**
 * Response DTO containing a list of proposal images.
 */
export class ProposalImagesResponseDto {
  @ApiProperty({
    description: 'List of images associated with the proposal',
    type: [ProposalImageDto],
  })
  images: ProposalImageDto[];
}
