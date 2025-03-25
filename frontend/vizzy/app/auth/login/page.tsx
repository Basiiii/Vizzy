import { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils/shadcn-merge';
import { buttonVariants } from '@/components/ui/common/button';
import { UserLogInForm } from './components/user-login-form';
import { ROUTES } from '@/lib/constants/routes/routes';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login on Vizzy!',
};

export default function LoginPage() {
  return (
    <div className="relative flex flex-col min-h-full">
      <Link
        href={ROUTES.SIGNUP}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8',
        )}
      >
        Sign-up
      </Link>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
            <p className="text-sm text-muted-foreground">
              Login with your credencials
            </p>
          </div>

          <UserLogInForm />

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="text-center">
              <Link
                href={ROUTES.RESET_PASSWORD}
                className="hover:text-primary transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
