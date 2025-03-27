import { JwtPayload } from '@/types/jwt-payload';
import { jwtDecode } from 'jwt-decode';

/**
 * Decodes a JWT (JSON Web Token) and returns its payload as a strongly-typed object.
 * This function uses the `jwt-decode` library to decode the token and assumes the payload
 * conforms to the `JwtPayload` type.
 *
 * @param {string} token - The JWT to decode.
 * @returns {JwtPayload} - The decoded payload of the JWT, typed according to the `JwtPayload` interface.
 *
 * @example
 * // Assuming a valid JWT and a `JwtPayload` type with `userId` and `role` fields
 * const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiYWRtaW4ifQ...';
 * const payload = decodeToken(token);
 * console.log(payload.userId); // Output: "123"
 * console.log(payload.role); // Output: "admin"
 *
 * @throws {Error} - If the token is malformed or cannot be decoded.
 */
export function decodeToken(token: string): JwtPayload {
  return jwtDecode<JwtPayload>(token);
}
