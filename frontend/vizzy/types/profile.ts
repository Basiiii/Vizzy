export interface Profile {
  name: string;
  location: string;
  avatarUrl: string;
  isVerified: boolean;
  memberSince: number;
  activeListings: number;
  totalSales: number;
}

export interface ProfileMetadata {
  id: string;
  email: string;
  name: string;
  username: string;
}
