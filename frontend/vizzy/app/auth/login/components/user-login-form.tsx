'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
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
  UserLogInSchema,
  FormValues,
} from '@/app/auth/login/schema/user-login-form-schema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/constants/routes/routes';
import { loginUserAction } from '@/lib/actions/auth/login-action';

export function UserLogInForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const t = useTranslations('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const router = useRouter();

  /**
   * Initializes the form using `react-hook-form` with validation powered by `zod`.
   * The form is tied to the `UserLogInSchema` validation schema.
   * The default form values are set for `email` and `password`.
   *
   * @type {ReturnType<typeof useForm<FormValues>>} The form hook instance that provides form methods and state.
   */
  const form = useForm<FormValues>({
    resolver: zodResolver(UserLogInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handles form submission for logging in.
   * This function is triggered when the form is submitted, sends the form data to the Supabase API,
   * and handles the response or errors accordingly.
   *
   * @param {FormValues} values - The form values containing email and password.
   * @returns {Promise<void>} - A promise that resolves when the submission is complete.
   */
  async function onSubmit(values: FormValues): Promise<void> {
    // Set loading state to true when the form is being submitted
    setIsLoading(true);

    try {
      await loginUserAction(values.email, values.password);

      router.push(ROUTES.HOME);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.warning('Error Logging in');
      } else {
        // Handle unknown error types (e.g., network errors, etc.)
        console.error('Unexpected error loggin in:', error);
        toast.warning('An unexpected error occurred. Please try again.');
      }
    } finally {
      // Set loading state to false once the operation is complete (successful or not)
      setIsLoading(false);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
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
                <FormLabel>{t('form.email')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.emailPlaceholder')}
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type={showPassword ? 'text' : 'password'}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      autoCorrect="off"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
                <FormLabel>{t('form.password')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('form.password')}
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full">
            {t('common.auth.logIn')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
