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
  userAuthFormSchema,
  FormValues,
} from '@/app/auth/change-password/schema/userAuthFormSchema';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updatePassword } from '../utils/updatepassword';
import { ROUTES } from '@/lib/constants/routes/routes';

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(userAuthFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: FormValues): Promise<void> {
    setIsLoading(true);

    try {
      if (values.password !== values.confirmPassword) {
        toast.warning('Passwords do not match.');
        return;
      }

      await updatePassword(values.password);
      router.push(ROUTES.HOME);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error changing password:', error);
        toast.warning(error.message);
      } else {
        console.error('Unexpected error changing password:', error);
        toast.warning('An unexpected error occurred. Please try again.');
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Confirm new password"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
