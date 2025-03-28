export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  // location: Location; // TODO: add geolocation
  is_deleted: boolean;
  deleted_at?: Date;
}
