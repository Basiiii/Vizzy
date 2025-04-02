import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/common/button';
import { ForgotPasswordForm } from './components/forgot-password-form';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ROUTES } from '@/lib/constants/routes/routes';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Recover your Vizzy account access!',
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex flex-col min-h-full">
      {/* Header actions */}
      <div className="flex justify-end space-x-2 p-4">
        <Link
          href={ROUTES.LOGIN}
          className={cn(buttonVariants({ variant: 'ghost' }))}
        >
          Login
        </Link>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Forgot Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to receive password reset instructions
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
