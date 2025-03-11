import z from 'zod';

export const UserLogInSchema = z.object({
  email: z.string().min(1), //must contain at least 1 character
  password: z.string().min(1), //must contain at least 1 character
});

export type FormValues = z.infer<typeof UserLogInSchema>;
