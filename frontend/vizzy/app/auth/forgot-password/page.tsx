import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/common/button';
import { ForgotPasswordForm } from './components/forgot-password-form';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ROUTES } from '@/lib/constants/routes/routes';
import { getTranslations } from 'next-intl/server';

// Get metadata translations
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('forgotPassword');
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ForgotPasswordPage() {
  // Get translations for both common and forgotPassword namespaces
  const t = await getTranslations('');

  return (
    <div className="relative flex flex-col min-h-full">
      {/* Header actions */}
      <div className="flex justify-end space-x-2 p-4">
        <Link
          href={ROUTES.LOGIN}
          className={cn(buttonVariants({ variant: 'ghost' }))}
        >
          {t('common.auth.logIn')}
        </Link>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('forgotPassword.title')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('forgotPassword.description')}
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
