import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  href: string;
  active?: boolean;
};

interface ProfileSidebarProps {
  items: NavItem[];
  className?: string;
}

export function ProfileSidebar({ items, className }: ProfileSidebarProps) {
  return (
    <div className={cn('w-full md:w-52 shrink-0', className)}>
      <div className="space-y-1">
        {items.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              'w-full justify-start',
              item.active ? 'font-medium bg-muted' : 'text-muted-foreground',
            )}
            asChild
          >
            <a href={item.href}>{item.title}</a>
          </Button>
        ))}
      </div>
    </div>
  );
}
