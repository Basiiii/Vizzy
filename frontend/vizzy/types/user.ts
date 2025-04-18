export interface UserData {
  id: string;
  username: string;
  name: string;
  email: string;
  location: Location;
  is_deleted: boolean;
  deleted_at?: Date;
}

// TODO: some use full_address others fullAddress
export interface UserLocation {
  id: number;
  full_address: string;
  lat: number;
  lon: number;
  created_at: string;
}
