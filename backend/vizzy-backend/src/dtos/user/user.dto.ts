export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  is_deleted: boolean;
  deleted_at?: Date;
}
