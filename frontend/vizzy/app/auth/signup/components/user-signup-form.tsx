'use client';

import * as React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
  userSignupFormSchema,
  FormValues,
} from '@/app/auth/signup/schema/user-signup-form-schema';
import { signupUser } from '../utils/signup-user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type UserSignupFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserSignupForm({ className, ...props }: UserSignupFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState<boolean>(false);
  const router = useRouter();
  const t = useTranslations('signUp');

  /**
   * Initializes the form using `react-hook-form` with validation powered by `zod`.
   * The form is tied to the `userAuthFormSchema` validation schema.
   * The default form values are set for `username`, `email`, `password`, and `confirmPassword`.
   *
   * @type {ReturnType<typeof useForm<FormValues>>} The form hook instance that provides form methods and state.
   */
  const form: ReturnType<typeof useForm<FormValues>> = useForm<FormValues>({
    resolver: zodResolver(userSignupFormSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * Handles the form submission for user sign-up.
   *
   * This function sets the loading state to true, attempts to sign up the user using the provided form values,
   * and navigates to the home page upon successful sign-up. If an error occurs during the sign-up process,
   * it parses the error message to determine the specific error code and displays an appropriate warning message
   * using a toast notification. The loading state is set to false after the operation completes, regardless of success or failure.
   *
   * @param {FormValues} values - The form values containing email, password, username, and name.
   * @returns {Promise<void>} - A promise that resolves when the function completes.
   */
  async function onSubmit(values: FormValues): Promise<void> {
    setIsLoading(true);

    try {
      await signupUser(
        values.email,
        values.password,
        values.username,
        values.name,
      );
      router.push('/');
    } catch (error: unknown) {
      let errorCode = 'GENERIC_ERROR';
      let errorMessage = 'An error occurred during sign-up.';

      // Parse structured error
      if (error instanceof Error) {
        console.log(error);
        try {
          const parsedError = JSON.parse(error.message);
          errorCode = parsedError.code || errorCode;
          errorMessage = parsedError.message || errorMessage;
        } catch {
          // Fallback to message if not structured error
          errorMessage = error.message;
        }
      }

      // Handle specific error codes
      switch (errorCode) {
        case 'EMAIL_EXISTS':
          toast.warning(t('errors.emailExists'));
          break;
        case 'USERNAME_EXISTS':
          toast.warning(t('errors.usernameExists'));
          break;
        case 'NETWORK_ERROR':
          toast.warning(t('errors.networkError'));
          break;
        default:
          console.error('Signup error:', errorMessage);
          toast.warning(t('errors.defaultError'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t('fields.labels.username')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('fields.labels.username')}
                    autoCapitalize="none"
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t('fields.labels.name')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('fields.labels.name')}
                    autoCapitalize="none"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t('fields.labels.email')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('fields.labels.email')}
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
                <FormLabel className="sr-only">
                  {t('fields.labels.password')}
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder={t('fields.labels.password')}
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
                      {showPassword
                        ? t('fields.icons.hidePassword')
                        : t('fields.icons.showPassword')}
                    </span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">
                  {t('fields.labels.confirmPassword')}
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder={t('fields.labels.confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword
                        ? t('fields.icons.hidePassword')
                        : t('fields.icons.showPassword')}
                    </span>
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('fields.actions.signingUp')}
              </>
            ) : (
              t('fields.actions.signUp')
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
