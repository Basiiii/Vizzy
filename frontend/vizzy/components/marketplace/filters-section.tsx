'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Label } from '@/components/ui/common/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { cn } from '@/lib/utils/shadcn-merge';
import { Button } from '@/components/ui/common/button';
import { useTranslations } from 'next-intl';
interface FiltersSectionProps {
  listingType: string;
  handleTypeChange: (value: string) => void;
  userLocation: { lat: number; lon: number; full_address: string } | null;
  useLocation: boolean;
  handleLocationToggle: (checked: boolean) => void;
  locationDistance: string;
  handleDistanceChange: (value: string) => void;
}

export function FiltersSection({
  listingType,
  handleTypeChange,
  userLocation,
  useLocation,
  handleLocationToggle,
  locationDistance,
  handleDistanceChange,
}: FiltersSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('marketplace');

  if (!userLocation) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3">
        {/* Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-9"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('filters.title')}
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 ml-1" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-1" />
            )}
          </Button>

          <div className="flex-1 min-w-[200px]">
            <Tabs
              defaultValue={listingType}
              className="w-full"
              onValueChange={handleTypeChange}
              value={listingType}
            >
              <TabsList className="grid grid-cols-5 h-9">
                <TabsTrigger value="all">{t('filterBadge.all')}</TabsTrigger>
                <TabsTrigger value="sale">{t('filterBadge.sale')}</TabsTrigger>
                <TabsTrigger value="swap">{t('filterBadge.swap')}</TabsTrigger>
                <TabsTrigger value="rental">
                  {t('filterBadge.rental')}
                </TabsTrigger>
                <TabsTrigger value="giveaway">
                  {t('filterBadge.giveaway')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Expanded Filters */}
        <div
          className={cn(
            'grid gap-4 transition-all duration-200 overflow-hidden',
            isExpanded
              ? 'grid-rows-[1fr] opacity-100 max-h-[500px]'
              : 'grid-rows-[0fr] opacity-0 max-h-0',
          )}
        >
          <div className="overflow-hidden">
            <div className="bg-card rounded-lg p-4 shadow-sm border border-border/40">
              {/* Location Filter */}

              <div className="space-y-3">
                <h3 className="text-sm font-medium">{t('filters.location')}</h3>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="use-location"
                    checked={useLocation}
                    onCheckedChange={handleLocationToggle}
                    className="mt-1"
                  />
                  <div>
                    <Label
                      htmlFor="use-location"
                      className="font-medium cursor-pointer"
                    >
                      {t('filters.locationToggle')}
                    </Label>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {userLocation.full_address}
                    </p>
                  </div>
                </div>

                {useLocation && (
                  <div className="mt-2">
                    <label className="text-xs font-medium mb-1 block">
                      {t('filters.distance')}
                    </label>
                    <Select
                      value={locationDistance}
                      onValueChange={handleDistanceChange}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue
                          placeholder={t('filters.distancePlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1 km</SelectItem>
                        <SelectItem value="5000">5 km</SelectItem>
                        <SelectItem value="10000">10 km</SelectItem>
                        <SelectItem value="25000">25 km</SelectItem>
                        <SelectItem value="50000">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
