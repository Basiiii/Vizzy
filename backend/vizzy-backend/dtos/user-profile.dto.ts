export interface Profile {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  isVerified: boolean;
  memberSince: number;
  activeListings: number;
  totalSales: number;
}
