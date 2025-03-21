'use client';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type NavItem = {
  title: string;
  href: string;
};

interface ProfileSidebarProps {
  items: NavItem[];
  className?: string;
}

export function ProfileSidebar({ items, className }: ProfileSidebarProps) {
  const pathname = usePathname();
  return (
    <div className={cn('w-full md:w-52 shrink-0', className)}>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                'w-full justify-start',

                isActive ? 'font-medium bg-muted' : 'text-muted-foreground',
              )}
              asChild
            >
              <Link href={item.href}>{String(item.title)}</Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
