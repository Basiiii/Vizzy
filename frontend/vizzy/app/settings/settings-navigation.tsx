'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CreditCard } from 'lucide-react';

export function SettingsNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      <Link
        href="/settings"
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          pathname === '/settings' ? 'bg-accent' : 'hover:bg-muted'
        }`}
      >
        <User className="h-4 w-4" />
        <span>Profile</span>
      </Link>
      <Link
        href="/settings/account"
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          pathname === '/settings/account' ? 'bg-accent' : 'hover:bg-muted'
        }`}
      >
        <CreditCard className="h-4 w-4" />
        <span>Account</span>
      </Link>
    </nav>
  );
}
