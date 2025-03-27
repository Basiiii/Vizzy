export interface Location {
  city: number;
  country: number;
}
export interface Contact {
  id: string;
  description: string;
  phone_number: string;
}

export interface UserData {
  id: string;
  username: string;
  name: string;
  email: string;
  location: Location;
  is_deleted: boolean;
  deleted_at?: Date;
  // blockedUsers: BlockedUser[];
  // favorites: Favorite[];
  contacts: Contact[];
  // listings: BaseProductListing[];
  // transactions: UserTransaction[];
  // proposals: BaseProposal[];
}
