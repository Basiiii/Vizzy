'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/common/button';
import ListingCard from '@/components/listings/listing-card';
import type { ListingBasic } from '@/types/listing';
import { fetchListings } from '@/lib/api/listings/fetch-user-listings';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { ListingDialog } from '@/components/listings/create-listing-dialog';
import { getUserAction } from '@/lib/utils/token/get-server-user-action';
import { PaginationControls } from '@/components/marketplace/pagination-controls';

export function ListingsPage() {
  const [listings, setListings] = useState<ListingBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    async function loadListings() {
      try {
        setIsLoading(true);
        setError(null);

        // Get user from cookie/token
        const user = await getUserAction();

        if (!user || !user.id) {
          setError('User not authenticated');
          setIsLoading(false);
          return;
        }

        // Fetch listings for the user
        const data = await fetchListings(user.id, currentPage, itemsPerPage);
        if (data.data) {
          setListings(data.data);
          setTotalPages(Math.ceil(data.data.length / itemsPerPage));
        }
      } catch (err) {
        console.error('Failed to load listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadListings();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (listings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">Você ainda não tem anúncios</h3>
          <p className="text-muted-foreground mt-1">
            Crie o seu primeiro anúncio para começar a vender
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            Criar Anúncio
          </Button>
          <ListingDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
      </div>
    );
  }

  // Loaded state with data
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} size="small" />
        ))}
      </div>
      {totalPages > 1 && (
        <PaginationControls
          page={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
}
