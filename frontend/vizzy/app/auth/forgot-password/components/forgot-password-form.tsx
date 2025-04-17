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
  forgotPasswordSchema,
  FormValues,
} from '@/app/auth/forgot-password/schema/forgot-password-schema';
import { sendResetEmail } from '../../../../lib/api/auth/password/send-reset-email';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/data-display/card';

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function ForgotPasswordForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isFinished, setIsFinished] = React.useState<boolean>(false);

  /**
   * Initializes the form using `react-hook-form` with validation powered by `zod`.
   * The form is tied to the `forgotPasswordSchema` validation schema.
   * The default form values are set for `email`.
   */
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
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
    setIsLoading(true);

    try {
      await sendResetEmail(values.email);
      setIsFinished(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error initiating password reset:', error);
        toast.warning(error.message);
      } else {
        console.error('Unexpected error initiating password reset:', error);
        toast.warning('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      form.handleSubmit(onSubmit)();
    }
  };

  return !isFinished ? (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          onKeyDown={handleKeyDown}
        >
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
              'Request Reset Link'
            )}
          </Button>
        </form>
      </Form>
    </div>
  ) : (
    // TODO: Melhorar UI?
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
