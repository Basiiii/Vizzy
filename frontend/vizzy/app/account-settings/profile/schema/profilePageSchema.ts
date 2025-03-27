import { z } from 'zod';

export const profileDataSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(50, 'O nome não pode ter mais de 50 caracteres'),
  username: z
    .string()
    .min(3, 'O nome de utilizador deve ter pelo menos 3 caracteres')
    .max(20, 'O nome de utilizador não pode ter mais de 20 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'O username só pode conter letras, números e underscores',
    ),
  country: z
    .object({ id: z.number(), name: z.string() })
    .nullable()
    .refine((val) => val !== null, 'O país é obrigatório'),
  state: z
    .object({ id: z.number(), name: z.string() })
    .nullable()
    .refine((val) => val !== null, 'O estado é obrigatório'),
  city: z
    .object({ id: z.number(), name: z.string() })
    .nullable()
    .refine((val) => val !== null, 'A cidade é obrigatória'),
});
