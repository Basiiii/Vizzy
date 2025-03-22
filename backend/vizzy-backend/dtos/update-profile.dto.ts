import { z } from 'zod';

// Definição do schema de validação utilizando Zod
export const UpdateProfileDto = z.object({
  name: z.string().min(2).max(50).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  username: z.string().min(3).max(20).nullable().optional(),
  location: z.string().min(1).max(255).nullable().optional(),
});

// Tipagem para garantir que os dados estão corretos ao serem usados
export type UpdateProfileDto = z.infer<typeof UpdateProfileDto>;
