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

export interface ProfileMetadata {
  id: string;
  email: string;
  name: string;
  username: string;
}

export interface ProfileInformation {
  name?: string | null;
  email?: string | null;
  username?: string | null;
  location?: string | null;
}
