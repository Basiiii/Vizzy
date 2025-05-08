'use client';

import { useState, useEffect, useCallback } from 'react';
import ListingCard from '@/components/listings/listing-card';
import { ListingBasic } from '@/types/listing';
import { Button } from '@/components/ui/common/button';
import { fetchListings } from '@/lib/api/listings/fetch-user-listings';

interface UserListingsProps {
  userid: string;
}

export default function UserListings(props: UserListingsProps) {
  const [listings, setListings] = useState<ListingBasic[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const limit = 8;

  const loadListings = useCallback(
    async (pageNum: number, isInitialLoad = false) => {
      try {
        setLoading(true);
        console.log(
          `Fetching listings for page ${pageNum}, isInitialLoad: ${isInitialLoad}`,
        );

        const newListingsResult = await fetchListings(
          props.userid,
          pageNum,
          limit,
        );

        if (!newListingsResult.error) {
          const newListings = newListingsResult.data;
          console.log(
            `Received ${newListings.length} listings for page ${pageNum}`,
          );
          console.log(newListings);

          if (newListings.length < limit) {
            console.log('No more listings to load');
            setHasMore(false);
          }

          if (isInitialLoad) {
            setListings(newListings);
            setInitialLoadDone(true);
          } else {
            setListings((prevListings) => [...prevListings, ...newListings]);
          }
        } else {
          console.error('Error fetching listings:', newListingsResult.error);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    },
    [props.userid, limit],
  );

  useEffect(() => {
    if (!initialLoadDone) {
      loadListings(1, true);
    }
  }, [loadListings, initialLoadDone]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    console.log(`Load more clicked, loading page ${nextPage}`);
    setPage(nextPage);
    loadListings(nextPage, false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings && listings.length > 0 ? (
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            {loading ? 'Loading listings...' : 'No listings found'}
          </div>
        )}
      </div>

      {hasMore && listings && listings.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            className="px-6"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
