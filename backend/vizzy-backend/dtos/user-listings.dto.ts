export interface Listing {
  id: string;
  title: string;
  type: 'sale' | 'rental' | 'giveaway' | 'swap';
  price?: string;
  pricePerDay?: string;
  imageUrl: string;
}
