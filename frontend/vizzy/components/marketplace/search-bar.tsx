import { Button } from '@/components/ui/common/button';
import { Input } from '@/components/ui/forms/input';
import { Search } from 'lucide-react';

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
  return (
    <div className="relative mb-6">
      <Input
        placeholder="Search for items..."
        className="pl-10 pr-4 py-6 text-lg rounded-lg border-border/40 focus-visible:ring-brand-500 focus-visible:border-brand-500 dark:border-border/60 dark:focus-visible:ring-brand-300 dark:focus-visible:border-brand-400"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
      <Button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-500 hover:bg-brand-400 dark:bg-brand-300"
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  );
}
