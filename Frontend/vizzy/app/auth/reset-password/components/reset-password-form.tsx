'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  resetPasswordSchema,
  FormValues,
} from '@/app/auth/reset-password/schema/resetPasswordSchema';
import { sendResetEmail } from '../utils/sendResetEmail';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function ResetPasswordForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();

  /**
   * Initializes the form using `react-hook-form` with validation powered by `zod`.
   * The form is tied to the `resetPasswordSchema` validation schema.
   * The default form values are set for `email`.
   *
   * @type {ReturnType<typeof useForm<FormValues>>} The form hook instance that provides form methods and state.
   */
  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Handles form submission for creating a new user.
   * This function is triggered when the form is submitted, sends the form data to the Supabase API,
   * and handles the response or errors accordingly.
   *
   * @param {FormValues} values - The form values containing email, password, username, and name.
   * @returns {Promise<void>} - A promise that resolves when the submission is complete.
   */
  async function onSubmit(values: FormValues): Promise<void> {
    // Set loading state to true when the form is being submitted
    setIsLoading(true);

    try {
      // Call the createSupabaseUser function with the form values
      await sendResetEmail(values.email);

      // If the user was successfully created, reroute to a different page
      router.push('/'); // TODO: send to home page
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message == 'Failed to sign up: User already registered') {
          toast.warning(
            'A user already exists with this email account. Please use another email address.',
          );
        } else {
          // Handle known error type (Error object)
          console.error('Error signing up:', error);
          toast.warning(error.message); // Display the message from the Error object
        }
      } else {
        // Handle unknown error types (e.g., network errors, etc.)
        console.error('Unexpected error signing up:', error);
        toast.warning('An unexpected error occurred. Please try again.');
      }
    } finally {
      // Set loading state to false once the operation is complete (successful or not)
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Email
              </>
            ) : (
              'Send Reset Password Email'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
