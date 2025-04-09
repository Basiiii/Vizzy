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
import { SlidersHorizontal, MapPin } from 'lucide-react';

interface FiltersSectionProps {
  listingType: string;
  handleTypeChange: (value: string) => void;
  userLocation: { lat: number; lon: number; address: string } | null;
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
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border/40">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Filters</h2>
      </div>

      <div className="space-y-5">
        {/* Listing Type Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Listing Type</label>
          <Tabs
            defaultValue={listingType}
            className="w-full"
            onValueChange={handleTypeChange}
            value={listingType}
          >
            <TabsList className="grid grid-cols-5 w-full [&>[data-state=active]]:bg-brand-500 [&>[data-state=active]]:text-white dark:[&>[data-state=active]]:bg-brand-300">
              <TabsTrigger className="cursor-pointer" value="all">
                All
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="sale">
                Sale
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="swap">
                Swap
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="rental">
                Rental
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="giveaway">
                Free
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Location Filter */}
        <div className="w-full">
          <label className="text-sm font-medium mb-2 block">Location</label>

          {userLocation && (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="use-location"
                  checked={useLocation}
                  onCheckedChange={handleLocationToggle}
                  className="cursor-pointer"
                />
                <div>
                  <Label
                    htmlFor="use-location"
                    className="font-medium cursor-pointer"
                  >
                    Show listings near me
                  </Label>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {userLocation.address}
                  </p>
                </div>
              </div>

              {useLocation && (
                <div className="mt-2">
                  <label className="text-sm font-medium mb-1 block">
                    Distance (meters)
                  </label>
                  <Select
                    value={locationDistance}
                    onValueChange={handleDistanceChange}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="1000">
                        1 km
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="5000">
                        5 km
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="10000">
                        10 km
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="25000">
                        25 km
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="50000">
                        50 km
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}