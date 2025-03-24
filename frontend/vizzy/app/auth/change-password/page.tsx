import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/button';
import { UserAuthForm } from './components/user-auth-form';
import Logo from '@/components/logo';

/**
 * Metadata for the Change Password page.
 * Defines the title and description used in the document head.
 */
export const metadata: Metadata = {
  title: 'Change Password',
  description: 'Change your Vizzy account password!',
};

/**
 * ChangePasswordPage Component
 *
 * This component renders the change password page for the application.
 * It includes a form for updating the user's password and a link to the login page.
 * The layout is split into two sections:
 * - **Left Column (Desktop only)**: Contains a motivational quote and the company logo.
 * - **Right Column**: Displays the password change form and navigation links.
 *
 * @returns {JSX.Element} - The rendered change password page.
 */
export default function ChangePasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Column - Hidden on mobile */}
      <div className="hidden min-h-screen bg-zinc-900 lg:block lg:w-1/2">
        <div className="flex h-full flex-col p-10 text-white">
          {/* Logo and Home Link */}
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
        {/* Login Link */}
        <Link
          href="/examples/authentication"
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8',
          )}
        >
          Login
        </Link>

        {/* Change Password Form Section */}
        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-[350px] space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Change Password
              </h1>
              <p className="text-sm text-muted-foreground">
                Change your Vizzy account password
              </p>
            </div>

            {/* User Authentication Form */}
            <UserAuthForm />

            {/* Terms and Privacy Policy */}
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
