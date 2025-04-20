import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Schema for validating the refresh token provided in the request body.
const refreshTokenSchema = z.object({
  /**
   * The refresh token string used to obtain a new access token.
   */
  refreshToken: z.string().min(1, 'Refresh token cannot be empty'),
});

/**
 * DTO for receiving the refresh token in the request body.
 * Validation and Swagger documentation are derived from the refreshTokenSchema using nestjs-zod.
 */
export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
