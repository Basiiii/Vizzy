import z from 'zod';

export const userAuthFormSchema = z
  .object({
    username: z.string().min(3, {
      message: 'Username must be at least 3 characters.',
    }),
    name: z.string().min(3, {
      message: 'Name must be at least 3 characters.',
    }), // TODO: verify requirements
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z
      .string()
      .min(10, {
        message: 'Password must be at least 10 characters.',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter.',
      })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter.',
      })
      .regex(/[0-9]/, {
        message: 'Password must contain at least one digit.',
      })
      .regex(/[\W_]/, {
        message: 'Password must contain at least one special character.',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type FormValues = z.infer<typeof userAuthFormSchema>;
