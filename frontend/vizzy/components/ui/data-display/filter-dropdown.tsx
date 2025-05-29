'use client';
import { Check, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/common/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlay/dropdown-menu';
import { Badge } from '@/components/ui/common/badge';
import { useTranslations } from 'next-intl';

export type FilterOption = {
  id: string;
  label: string;
  checked: boolean;
};

export interface FilterDropdownProps {
  options: FilterOption[];
  onChange: (options: FilterOption[]) => void;
  label?: string;
  buttonText?: string;
  showActiveBadges?: boolean;
  showActiveCount?: boolean;
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FilterDropdown({
  options,
  onChange,
  label = 'Filter by status',
  buttonText = 'Filter',
  showActiveBadges = true,
  showActiveCount = true,
  className = '',
  isOpen: controlledIsOpen,
  onOpenChange,
}: FilterDropdownProps) {
  // Use internal state if not controlled externally
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const t = useTranslations('dashboard.proposals.filterOptions');

  // Sync local options with props
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const activeFiltersCount = localOptions.filter(
    (option) => option.checked,
  ).length;

  const handleOpenChange = (open: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
  };

  const toggleFilter = (id: string) => {
    const updatedOptions = localOptions.map((option) =>
      option.id === id ? { ...option, checked: !option.checked } : option,
    );
    setLocalOptions(updatedOptions);
    onChange(updatedOptions);
  };

  const clearFilters = () => {
    const clearedOptions = localOptions.map((option) => ({
      ...option,
      checked: false,
    }));
    setLocalOptions(clearedOptions);
    onChange(clearedOptions);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <DropdownMenu
          open={isOpen}
          onOpenChange={handleOpenChange}
          modal={false}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{buttonText}</span>
              {showActiveCount && activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full px-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" sideOffset={5}>
            <DropdownMenuLabel>{label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {localOptions.map((option) => (
              <div key={option.id} onClick={(e) => e.preventDefault()}>
                <DropdownMenuCheckboxItem
                  checked={option.checked}
                  onSelect={(e) => {
                    e.preventDefault(); // Prevent closing
                    toggleFilter(option.id);
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              </div>
            ))}
            {activeFiltersCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      clearFilters();
                    }}
                  >
                    {t('clearFilters')}
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showActiveBadges && activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localOptions
            .filter((option) => option.checked)
            .map((option) => (
              <Badge
                key={option.id}
                variant="outline"
                className="flex items-center gap-1"
              >
                {option.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => toggleFilter(option.id)}
                >
                  <Check className="h-3 w-3" />
                  <span className="sr-only">Remove {option.label} filter</span>
                </Button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
