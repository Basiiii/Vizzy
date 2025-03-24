import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/common/button';
import { UserLogInForm } from './components/user-login-form';
import Logo from '@/components/branding/logo';
import { ROUTES } from '@/lib/constants/routes/routes';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login on Vizzy!',
};

/**
 * LoginPage Component
 *
 * This component renders the login page for the application. It includes a form for user authentication
 * and a link to the sign-up page. The layout is split into two columns: a left column with a quote and logo,
 * and a right column with the login form.
 *
 * @returns {JSX.Element} - The rendered login page.
 */
export default function LoginPage() {
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
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Column - Full width on mobile */}
      <div className="w-full min-h-screen lg:w-1/2">
        <Link
          href={ROUTES.SIGNUP}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8',
          )}
        >
          Sign-up
        </Link>

        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-[350px] space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
              <p className="text-sm text-muted-foreground">
                Login with your credencials
              </p>
            </div>

            <UserLogInForm />

            <p className="px-8 text-center text-sm text-muted-foreground">
              <Link
                href={ROUTES.RESET_PASSWORD}
                className="underline underline-offset-4 hover:text-primary"
              >
                Reset your Password
              </Link>
            </p>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
