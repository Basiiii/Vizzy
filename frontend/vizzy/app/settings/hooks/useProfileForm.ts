import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(30, { message: 'Username must not be longer than 30 characters.' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  location: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function useProfileForm() {
  return useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      location: '',
    },
  });
}
