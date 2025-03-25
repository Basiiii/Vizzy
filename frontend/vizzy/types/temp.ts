//TODO: temporary types waiting for endpoints to be made
export interface ProfileInformation {
  username: string;
  name: string;
  email: string;
  location: string;
  avatarUrl: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
}
