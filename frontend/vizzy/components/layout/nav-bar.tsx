import Logo from '@/components/logo';
import { UserMenu } from '@/components/layout/user-menu';
import { JSX } from 'react';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { ThemeToggle } from '../theme/theme-toggle';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import LoginButton from './login-button';

interface NavBarProps {
  username: string;
  avatarUrl: string;
}

/**
 * Navigation bar component that displays the application logo, user avatar,
 * and a dropdown menu with various options.
 *
 * This component is designed to be simple and flexible:
 * - The logo is displayed on the left.
 * - The user's avatar is shown on the right, which opens a dropdown menu when clicked.
 *
 * @component
 * @param {NavBarProps} props - The component's properties.
 * @param {string} props.username - The name of the user, displayed in the dropdown menu and used for the avatar's fallback text.
 * @param {string} props.avatarUrl - The URL of the user's avatar image.
 * @returns {JSX.Element} The rendered navigation bar component.
 */
export default async function NavBar({
  username,
  avatarUrl,
}: NavBarProps): Promise<JSX.Element> {
  const t = await getTranslations('common');

  return (
    <div className="fixed top-0 left-0 right-0 text-white h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm z-50 border-b">
      <div className="flex items-center">
        <Link className="cursor-pointer" href="/">
          <Logo />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
        {username ? (
          <UserMenu username={username} avatarUrl={avatarUrl} />
        ) : (
          <LoginButton label={t('auth.logIn')} />
        )}
      </div>
    </div>
  );
}
