export interface JwtPayload {
  sub: string;
  email: string;
  user_metadata: {
    username: string;
    sub: string;
  };
  iat: number;
  exp: number;
}

// Type for the Request with user
export interface RequestWithUser extends Request {
  user: JwtPayload;
}
