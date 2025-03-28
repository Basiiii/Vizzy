import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Backend Login Schema
 *
 * Used for validating the login request in the backend.
 */
export const backendLoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[\W_]/),
});

/**
 * Login Data Transfer Object (DTO)
 *
 * Extends the Zod schema to create a NestJS-compatible DTO.
 * This DTO is used in the `AuthController` to validate and
 * transform incoming login requests.
 */
export class LoginDto extends createZodDto(backendLoginSchema) {}
