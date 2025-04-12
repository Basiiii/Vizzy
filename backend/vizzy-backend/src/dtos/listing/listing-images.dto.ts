export interface ListingImageDto {
  path: string;
  url: string;
}

export interface ListingImagesResponseDto {
  images: ListingImageDto[];
}
