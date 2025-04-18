import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/common/button';
import { UserLogInForm } from './components/user-login-form';
import { ROUTES } from '@/lib/constants/routes/routes';
import { getTranslations } from 'next-intl/server';

// Get metadata translations
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LoginPage() {
  const t = await getTranslations('');

  return (
    <div className="relative flex flex-col min-h-full">
      <Link
        href={ROUTES.SIGNUP}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8',
        )}
      >
        {t('common.auth.signUp')}
      </Link>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('login.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('login.description')}
            </p>
          </div>

          <UserLogInForm />

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="text-center">
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="hover:text-primary transition-colors"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
