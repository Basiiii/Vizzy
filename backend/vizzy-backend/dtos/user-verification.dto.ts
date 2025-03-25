export interface VerifyResponse {
  ok: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
  };
}
