import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payload.type';

/**
 * Strategy for handling JWT authentication with Supabase tokens
 * Extends Passport's JWT strategy for NestJS integration
 */
@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  /**
   * Initializes the Supabase JWT strategy
   * @param configService Service to access environment configuration
   */
  public constructor(private readonly configService: ConfigService) {
    super({
      // Extracts JWT from the Authorization header with Bearer scheme
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Ensures token expiration is checked
      ignoreExpiration: false,
      // Uses JWT secret from environment variables for token verification
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload after token verification
   * @param payload Decoded JWT payload containing user information
   * @returns Promise containing the validated payload
   */
  validate(payload: JwtPayload): Promise<JwtPayload> {
    return Promise.resolve(payload);
  }
}
