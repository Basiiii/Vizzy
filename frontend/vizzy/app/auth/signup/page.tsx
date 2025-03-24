import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/button';
import { UserSignupForm } from './components/user-signup-form';
import Logo from '@/components/logo';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants/routes/routes';

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
  const t = useTranslations('');

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Hidden on mobile */}
      <div className="hidden min-h-screen bg-zinc-900 lg:block lg:w-1/2">
        <div className="flex h-full flex-col p-10 text-white">
          <Link href="/" aria-label="Go to Home page">
            <Logo />
          </Link>
          {/* TODO: make a list of quotes? */}
          <div className="mt-auto pt-10">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;{t('common.quote')}&rdquo;</p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Column - Full width on mobile */}
      <div className="w-full min-h-screen lg:w-1/2">
        <Link
          href={ROUTES.LOGIN}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'absolute right-4 top-4 md:right-8 md:top-8',
          )}
        >
          {t('common.auth.logIn')}
        </Link>

        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-[350px] space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t('signUp.common.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('signUp.common.subtitle')}
              </p>
            </div>

            <UserSignupForm />

            <p className="px-8 text-center text-sm text-muted-foreground">
              {t('common.terms.byClicking')}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('common.terms.tos')}
              </Link>{' '}
              {t('common.and')}{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('common.terms.privacyPolicy')}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
