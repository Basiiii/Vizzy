'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/data-display/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlay/dropdown-menu';
import { logoutUserAction } from '@/lib/actions/auth/logout-action';
import { ROUTES } from '@/lib/constants/routes/routes';
import {
  User,
  CreditCard,
  Settings,
  LogOut,
  Activity,
  Inbox,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { JSX } from 'react';

interface UserMenuProps {
  username: string;
  avatarUrl: string;
}

/**
 * UserMenu Component
 *
 * A dropdown menu that displays user-related options and actions. It includes an avatar as the trigger
 * for the dropdown, and when clicked, it reveals a menu with options such as viewing the user's profile,
 * proposals, transactions, settings, and logging out.
 *
 * @param {Object} props - The component props.
 * @param {string} props.username - The name of the user. This is displayed in the dropdown menu label
 *                                  and is used to generate the fallback avatar initials if no avatar image is provided.
 * @param {string} props.avatarUrl - The URL of the user's avatar image. If not provided, the fallback
 *                                   avatar will display the initials of the user's name.
 *
 * @returns {JSX.Element} - The rendered UserMenu component.
 */
export function UserMenu({ username, avatarUrl }: UserMenuProps): JSX.Element {
  const router = useRouter();
  const t = useTranslations('userMenu');

  const handleLogout = async () => {
    await logoutUserAction();
    router.push(ROUTES.LOGIN);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback>
            {username
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(ROUTES.PROFILE)}
          >
            <User className="mr-2 h-4 w-4" />
            <span>{t('profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`${ROUTES.DASHBOARD}?activeTab=overview`)}
          >
            <Activity className="mr-2 h-4 w-4" />
            <span>{t('overview')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`${ROUTES.DASHBOARD}?activeTab=listings`)}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t('listings')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(`${ROUTES.DASHBOARD}?activeTab=proposals`)}
          >
            <Inbox className="mr-2 h-4 w-4" />
            <span>{t('proposals')}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => router.push(ROUTES.SETTINGS)}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive hover:text-destructive-foreground focus:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 text-red" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
