import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { UserAuthForm } from './components/user-auth-form';
import Logo from '@/components/logo';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create an account on Vizzy!',
};

/**
 * SignUpPage Component
 *
 * This component renders the sign-up page for the application. It includes a form for user authentication
 * and a link to the login page. The layout is split into two columns: a left column with a quote and logo,
 * and a right column with the sign-up form.
 *
 * @returns {JSX.Element} - The rendered sign-up page.
 */
export default function SignUpPage() {
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
          href="/examples/authentication"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8',
          )}
        >
          Login
        </Link>

        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-[350px] space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>

            <UserAuthForm />

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
