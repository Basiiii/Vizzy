import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Backend Reset Password Schema
 *
 * Used for validating the password reset request in the backend.
 */
export const backendResetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(10)
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[\W_]/, 'Password must contain at least one special character'),
});

/**
 * Reset Password Data Transfer Object (DTO)
 *
 * Extends the Zod schema to create a NestJS-compatible DTO.
 * This DTO is used in the `AuthController` to validate and
 * transform incoming password reset requests.
 */
export class ResetPasswordDto extends createZodDto(
  backendResetPasswordSchema,
) {}
