'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/common/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/forms/form';
import { Input } from '@/components/ui/forms/input';
import {
  AccountSetupValues,
  accountSetupSchema,
} from '../../schema/multi-step-signup-schema';
import { Eye, EyeOff } from 'lucide-react';

interface AccountSetupStepProps {
  defaultValues: Partial<AccountSetupValues>;
  onNext: (data: AccountSetupValues) => void;
  onBack: () => void;
  fieldErrors?: Record<string, string>;
  clearFieldError?: (field: string) => void;
}

export function AccountSetupStep({
  defaultValues,
  onNext,
  onBack,
  fieldErrors = {},
  clearFieldError,
}: AccountSetupStepProps) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState<boolean>(false);

  const form = useForm<AccountSetupValues>({
    resolver: zodResolver(accountSetupSchema),
    defaultValues: {
      username: defaultValues.username || '',
      password: defaultValues.password || '',
      confirmPassword: defaultValues.confirmPassword || '',
    },
  });

  const onSubmit = (data: AccountSetupValues) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className={fieldErrors.username ? 'error' : ''}>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Choose a username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className={fieldErrors.username ? 'border-red-500' : ''}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // Clear API error when user types
                    if (fieldErrors.username && clearFieldError) {
                      clearFieldError('username');
                    }
                  }}
                />
              </FormControl>
              <FormMessage>
                {fieldErrors.username ||
                  form.formState.errors.username?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="Create a password"
                    type={showPassword ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect="off"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
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
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    autoCorrect="off"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </Form>
  );
}
