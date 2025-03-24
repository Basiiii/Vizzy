'use client';

import * as React from 'react';
import { Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils/shadcn-merge';
import { Button } from '@/components/ui/common/button';
import { Input } from '@/components/ui/forms/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/forms/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  resetPasswordSchema,
  FormValues,
} from '@/app/auth/reset-password/schema/resetPasswordSchema';
import { sendResetEmail } from '../utils/sendResetEmail';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/data-display/card';

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function ResetPasswordForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isFinished, setIsFinished] = React.useState<boolean>(false);

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
   * Handles form submission for resetting a user password.
   * This function is triggered when the form is submitted, sends the form data to the Supabase API,
   * and handles the response or errors accordingly.
   *
   * @param {FormValues} values - The form values containing email.
   * @returns {Promise<void>} - A promise that resolves when the submission is complete.
   */
  async function onSubmit(values: FormValues): Promise<void> {
    // Set loading state to true when the form is being submitted
    setIsLoading(true);

    try {
      // Call the sendResetEmail function with the form values
      await sendResetEmail(values.email);
      setIsFinished(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Handle known error type (Error object)
        console.error('Error resetting password:', error);
        toast.warning(error.message); // Display the message from the Error object
      } else {
        // Handle unknown error types (e.g., network errors, etc.)
        console.error('Unexpected error resetting password:', error);
        toast.warning('An unexpected error occurred. Please try again.');
      }
    } finally {
      // Set loading state to false once the operation is complete (successful or not)
      setIsLoading(false);
    }
  }

  return !isFinished ? (
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
  ) : (
    <Card className="border-primary/20">
      <CardContent>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Check Your Email</h3>
            <p className="text-muted-foreground">
              If the email address you entered is associated with an account,
              you will receive an email with instructions on how to reset your
              password.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
