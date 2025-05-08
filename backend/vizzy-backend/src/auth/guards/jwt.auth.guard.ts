import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that uses JWT strategy for protecting routes
 * Extends Passport's AuthGuard to validate JWT tokens
 */
export class JwtAuthGuard extends AuthGuard('jwt') {}
