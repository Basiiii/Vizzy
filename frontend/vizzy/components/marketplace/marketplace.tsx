'use client';

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
import { fetchHomeListings } from '@/lib/api/listings/fetch-user-listings';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ListingBasic } from '@/types/listing';

export default function Marketplace() {
  const [listings, setListings] = useState<ListingBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [listingType, setListingType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const limit = 12;

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        const data = await fetchHomeListings(1, limit, listingType, searchTerm);
        setListings(data);
        setPage(1);
        setHasMore(data.length === limit);
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, [listingType, searchTerm]);

  const handleLoadMore = async () => {
    try {
      setLoading(true);
      const nextPage = page + 1;
      const newListings = await fetchHomeListings(
        nextPage,
        limit,
        listingType,
        searchTerm,
      );

      if (newListings.length > 0) {
        setListings([...listings, ...newListings]);
        setPage(nextPage);
        setHasMore(newListings.length === limit);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleTypeChange = (value: string) => {
    setListingType(value);
  };

  return (
    <div className="container mx-auto xl:px-14 px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-6">Find what you need</h1>

        {/* Search Bar */}
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
              <Tabs
                defaultValue="all"
                className="w-full"
                onValueChange={handleTypeChange}
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
          {/* <p className="text-muted-foreground">{listings.length} items found</p> */}
        </div>

        {loading && listings.length === 0 ? (
          <div className="text-center py-12">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">No listings found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-10 text-center">
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-brand-500 hover:bg-brand-500/30 bg-brand-500/10 cursor-pointer"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
