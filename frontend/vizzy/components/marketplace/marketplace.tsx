import ListingCard from '@/components/listings/listing-card';
import { Button } from '@/components/ui/common/button';
import { Input } from '@/components/ui/forms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Search, SlidersHorizontal } from 'lucide-react';

// Using the provided interface
interface ListingBasic {
  id: string;
  title: string;
  type: 'sale' | 'rental' | 'giveaway' | 'swap';
  price?: string;
  priceperday?: string;
  image_url: string;
}

// Mock data for demonstration
const mockListings: ListingBasic[] = [
  {
    id: '1',
    title: 'Vintage Leather Sofa',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'sale',
    price: '299',
  },
  {
    id: '2',
    title: 'Mountain Bike',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'swap',
  },
  {
    id: '3',
    title: 'iPhone 13 Pro',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'sale',
    price: '699',
  },
  {
    id: '4',
    title: 'Summer Cottage',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'rental',
    priceperday: '85',
  },
  {
    id: '5',
    title: 'Plant Collection',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'giveaway',
  },
  {
    id: '6',
    title: 'Designer Dress',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'sale',
    price: '120',
  },
  {
    id: '7',
    title: 'Camping Equipment',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'rental',
    priceperday: '25',
  },
  {
    id: '8',
    title: 'Acoustic Guitar',
    image_url: '/placeholder.svg?height=400&width=400',
    type: 'swap',
  },
];

export default function Marketplace() {
  return (
    <div className="container mx-auto xl:px-14 px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-6">Find what you need</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Input
            placeholder="Search for items..."
            className="pl-10 pr-4 py-6 text-lg rounded-lg border-border/40 focus-visible:ring-brand-500 focus-visible:border-brand-500 dark:border-border/60 dark:focus-visible:ring-brand-300 dark:focus-visible:border-brand-400"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-500 hover:bg-brand-400 dark:bg-brand-300">
            Search
          </Button>
        </div>

        {/* Filters Section - Revamped */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border/40">
          <div className="flex items-center gap-2 mb-5">
            <SlidersHorizontal className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Filters</h2>
          </div>

          <div className="space-y-5">
            {/* Listing Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Listing Type
              </label>
              <Tabs defaultValue="all" className="w-full">
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

            {/* Location Filter - Full Width */}
            <div className="w-full">
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select defaultValue="any">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="close" disabled>
                    Close to me
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Listings</h2>
          {/* <p className="text-muted-foreground">
            {mockListings.length} items found
          </p> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            className="px-8 border-brand-500 hover:bg-brand-500/30 bg-brand-500/10 cursor-pointer"
          >
            Load More
          </Button>
        </div>
      </section>
    </div>
  );
}
