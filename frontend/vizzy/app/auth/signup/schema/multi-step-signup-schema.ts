import z from 'zod';

// Step 1: Basic Info
export const basicInfoSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
});

// Create the base object schema for account setup
const accountSetupBaseSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
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
});

// Step 2: Account Setup with refinement
export const accountSetupSchema = accountSetupBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  },
);

// Step 3: Location
export const locationSchema = z.object({
  country: z.string().min(2, {
    message: 'Country must be at least 2 characters.',
  }),
  village: z.string().min(2, {
    message: 'Village must be at least 2 characters.',
  }),
});

// Combined schema for the entire form
export const multiStepSignupSchema = z.object({
  ...basicInfoSchema.shape,
  ...accountSetupBaseSchema.shape,
  ...locationSchema.shape,
});

export type BasicInfoValues = z.infer<typeof basicInfoSchema>;
export type AccountSetupValues = z.infer<typeof accountSetupSchema>;
export type LocationValues = z.infer<typeof locationSchema>;
export type MultiStepSignupValues = z.infer<typeof multiStepSignupSchema>;
