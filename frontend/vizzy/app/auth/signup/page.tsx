import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '@/lib/constants/routes/routes';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/common/button';
import { MultiStepSignupForm } from './components/multi-step-signup-form';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create an account on Vizzy!',
};

export default async function SignUpPage() {
  const t = await getTranslations('');

  return (
    <div className="relative flex flex-col min-h-full">
      <Link
        href={ROUTES.LOGIN}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8',
        )}
      >
        {t('common.auth.logIn')}
      </Link>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[450px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('signUp.common.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('signUp.common.subtitle')}
            </p>
          </div>

          <MultiStepSignupForm />

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
  );
}
