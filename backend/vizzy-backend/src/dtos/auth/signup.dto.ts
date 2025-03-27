import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Backend SignUp Schema
 *
 * Used for validating the sign-up request in the backend.
 * Excludes the `confirmPassword` field since it's only needed on the frontend.
 */
export const backendSignUpSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[\W_]/),
  username: z.string().min(3),
  name: z.string().min(3),
});

/**
 * SignUp Data Transfer Object (DTO)
 *
 * Extends the Zod schema to create a NestJS-compatible DTO.
 * This DTO is used in the `AuthController` to validate and
 * transform incoming sign-up requests.
 */
export class SignUpDto extends createZodDto(backendSignUpSchema) {}
