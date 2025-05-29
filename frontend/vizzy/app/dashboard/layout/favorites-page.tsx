'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/common/button';
import ListingCard from '@/components/listings/listing-card';
import type { ListingBasic } from '@/types/listing';
import { getFavorites } from '@/lib/api/favorites/get-favorites';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { PaginationControls } from '@/components/marketplace/pagination-controls';
import { useTranslations } from 'next-intl';

export function FavoritesPage() {
  const t = useTranslations('favoritesPage');
  const [favorites, setFavorites] = useState<ListingBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    async function loadFavorites() {
      try {
        setIsLoading(true);
        setError(null);

        const offset = (currentPage - 1) * itemsPerPage;
        const result = await getFavorites({ limit: itemsPerPage, offset });

        if (result.data) {
          setFavorites(result.data);
          // Simple heuristic for total pages: if we get back fewer than itemsPerPage,
          // assume this is the last page. This is not perfect without total count from backend.
          if (result.data.length < itemsPerPage) {
            setTotalPages(currentPage);
          } else {
            // Assume there might be more pages if we got a full set, or if it's the first page
            setTotalPages((prevTotalPages) =>
              result.data.length > 0
                ? Math.max(prevTotalPages, currentPage + 1)
                : 1,
            );
          }
        } else {
          setError(t('error.loadFailed'));
          setFavorites([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
        setError(t('error.loadFailedWithRetry'));
        setFavorites([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, [currentPage, t]);

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
            {t('error.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">{t('empty.title')}</h3>
          <p className="text-muted-foreground mt-1">{t('empty.description')}</p>
        </div>
      </div>
    );
  }

  // Loaded state with data
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((listing) => (
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
