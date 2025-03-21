import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ResetPasswordForm } from './components/reset-password-form';
import Logo from '@/components/logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: "Reset your Vizzy account's password!",
};

/**
 * ResetPasswordPage Component
 *
 * This component renders the reset password page for the application. It includes a form for user email
 * and a link to the login page. The layout is split into two columns: a left column with a quote and logo,
 * and a right column with the reset password form.
 *
 * @returns {JSX.Element} - The rendered reset password page.
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Column - Hidden on mobile */}
      <div className="hidden min-h-screen bg-zinc-900 lg:block lg:w-1/2">
        <div className="flex h-full flex-col p-10 text-white">
          <Link href="/" aria-label="Go to Home page">
            <Logo />
          </Link>
          <div className="mt-auto pt-10">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;&#201; rid&#237;cula a quantidade de dinheiro que j&#225;
                poupei e fiz na VIZZY. Fant&#225;stico!&rdquo;
              </p>
              <footer className="text-sm">Tio Patinhas</footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Column - Full width on mobile */}
      <div className="w-full min-h-screen lg:w-1/2">
        {/* Container flex para alinhar os botões lado a lado */}
        <div className="flex justify-end space-x-2 p-4">
          <Link
            href={ROUTES.LOGIN}
            className={cn(buttonVariants({ variant: 'ghost' }))}
          >
            Login
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-[350px] space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Reset Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to reset your password
              </p>
            </div>

            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
