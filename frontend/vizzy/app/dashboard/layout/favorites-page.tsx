'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/common/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { useTranslations } from 'use-intl';

// Define the type for a favorite item
interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  addedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;
  const t = useTranslations('favorites');

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/v1/favorites?page=${currentPage}&limit=${itemsPerPage}`,
        );

        if (!res.ok) throw new Error('Failed to fetch favorites');

        const data = await res.json();

        if (data) {
          setFavorites(data.data?.favorites || []);
          const total = data.data?.totalFavorites || 0;
          setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
        } else {
          setFavorites([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setError(t('errors.fetchFailed'));
        setFavorites([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, [currentPage, t]);

  const removeFavorite = async (id: string) => {
    try {
      const res = await fetch(`/v1/favorites/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to remove favorite');

      setFavorites((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError(t('errors.removeFailed'));
    }
  };

  // Empty favorites component
  function EmptyFavorites() {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold"> {t('f.titlename')}</h2>
        <p className="mb-8 mt-2 text-center text-sm text-muted-foreground max-w-sm">
          {t('f.descriptionbox')}
        </p>
      </div>
    );
  }

  // Favorites list content
  function renderFavoritesList() {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-[200px] bg-muted rounded-t-lg" />
              <CardHeader>
                <div className="h-5 w-2/3 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded mt-2" />
              </CardHeader>
              <CardFooter>
                <div className="h-9 w-full bg-muted rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (favorites.length === 0) {
      return <EmptyFavorites />;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative h-[200px] w-full">
              <Image
                src={item.image || '/placeholder.svg'}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={item.url}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFavorite(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {' '}
              {t('f.title')}
            </h1>
            <p className="text-muted-foreground">{t('f.titledescription')}</p>
          </div>
        </div>

        {renderFavoritesList()}
      </div>
    </div>
  );
}
