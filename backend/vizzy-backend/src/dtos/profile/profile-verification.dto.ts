export interface ProfileVerificationDto {
  ok: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
  };
}
