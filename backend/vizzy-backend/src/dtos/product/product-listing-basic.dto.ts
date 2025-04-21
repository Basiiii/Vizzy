export class ProductListingBasic {
  id: number;
  name: string;
  image_url?: string;

  constructor(partial: Partial<ProductListingBasic>) {
    Object.assign(this, partial);
  }
}
