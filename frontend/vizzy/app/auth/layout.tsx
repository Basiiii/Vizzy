import Logo from '@/components/branding/logo';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('common');
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
                &ldquo;{t('quote')}&rdquo;
              </p>
              <footer className="text-sm">Maria Santos, {t('member')} 2025</footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Column - Full width on mobile */}
      <div className="w-full min-h-screen flex flex-col lg:w-1/2">
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
}
