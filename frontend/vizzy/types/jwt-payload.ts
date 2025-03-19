interface AppMetadata {
  provider: string;
  providers: string[];
}

interface UserMetadata {
  email: string;
  email_verified: boolean;
  name: string;
  phone_verified: boolean;
  sub: string;
  username: string;
}

interface AmrEntry {
  method: string;
  timestamp: number;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  phone: string;
  app_metadata: AppMetadata;
  user_metadata: UserMetadata;
  role: string;
  aal: string;
  amr: AmrEntry[];
  session_id: string;
  is_anonymous: boolean;
}
