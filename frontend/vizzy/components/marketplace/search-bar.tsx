'use client';

import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/common/button';
import { Input } from '@/components/ui/forms/input';
import { useTranslations } from 'next-intl';
interface SearchBarProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: () => void;
}

export function SearchBar({
  searchInput,
  setSearchInput,
  handleSearch,
}: SearchBarProps) {
  const t = useTranslations('marketplace');
  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          className="pl-10 pr-20 h-12 rounded-lg border-border/40 focus-visible:ring-primary focus-visible:border-primary"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-[70px] top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
          onClick={handleSearch}
          size="sm"
        >
          {t('searchButton')}
        </Button>
      </div>
    </div>
  );
}
