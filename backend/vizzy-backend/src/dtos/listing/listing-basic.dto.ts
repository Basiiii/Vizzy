export interface ListingBasic {
  id: string;
  title: string;
  type: 'sale' | 'rental' | 'giveaway' | 'swap';
  price?: string;
  priceperday?: string;
  image_url: string;
}
