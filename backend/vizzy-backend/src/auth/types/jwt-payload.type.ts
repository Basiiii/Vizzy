/**
 * Interface representing the payload structure of a JWT token
 * @interface JwtPayload
 * @property {string} sub - The subject identifier of the token
 * @property {string} email - The email address of the user
 * @property {Object} user_metadata - Metadata containing user information
 * @property {string} user_metadata.sub - The subject identifier in metadata
 * @property {string} user_metadata.name - The full name of the user
 * @property {string} user_metadata.email - The email address in metadata
 * @property {string} user_metadata.username - The username of the user
 * @property {number} iat - Issued at timestamp (Unix timestamp)
 * @property {number} exp - Expiration timestamp (Unix timestamp)
 */
export interface JwtPayload {
  sub: string;
  email: string;
  user_metadata: {
    sub: string;
    name: string;
    email: string;
    username: string;
  };
  iat: number;
  exp: number;
}

/**
 * Interface extending the Request type to include user information
 * @interface RequestWithUser
 * @extends {Request}
 * @property {JwtPayload} user - The JWT payload containing user information
 */
export interface RequestWithUser extends Request {
  user: JwtPayload;
}
