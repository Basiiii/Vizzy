import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(50).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  username: z.string().min(3).max(20).nullable().optional(),
  location: z.string().min(1).max(255).nullable().optional(),
});

export interface UpdateProfileDto {
  name?: string | null;
  email?: string | null;
  username?: string | null;
  location?: string | null;
}
