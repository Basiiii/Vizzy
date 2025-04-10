'use client';

import { use, useEffect, useState } from 'react';
import { Calendar, Heart, Info, MapPin, Tag } from 'lucide-react';
import Image from 'next/image';
import type { Listing } from '@/types/listing';
import { fetchListing } from '@/lib/api/listings/listings';
import { Card, CardContent } from '@/components/ui/data-display/card';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { Button } from '@/components/ui/common/button';
import { Badge } from '@/components/ui/common/badge';
import { PurchaseProposalDialog } from '@/components/proposals/purchase-proposal-dialog';
import { RentalProposalDialog } from '@/components/proposals/rental-proposal-dialog';
import { ExchangeProposalDialog } from '@/components/proposals/swap-proposal-dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/data-display/carousel';
import { Separator } from '@/components/ui/layout/separator';
import { useTranslations } from 'next-intl';
import type { CreateProposalDto } from '@/types/proposal'; // Add this import at the top

export default function ProductListing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const listingT = useTranslations('listing');

  useEffect(() => {
    const getListing = async () => {
      try {
        const data = await fetchListing(id);
        setListing(data);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getListing();
  }, [id]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden border shadow-sm">
        <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-1/3" />
            <div className="pt-8">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (!listing) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Info className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold">
          {listingT('details.notFound')}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {listingT('details.notFoundDesc')}
        </p>
        <Button className="mt-6 bg-green-500 hover:bg-green-600">
          {listingT('details.browseOthers')}
        </Button>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderListingSpecificInfo = () => {
    switch (listing.listing_type) {
      case 'sale':
        return (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-4xl font-bold text-green-500">
                {listing.price}€
              </h2>
              <div className="flex items-center gap-2">
                {listing.is_negotiable && (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    {listingT('details.negotiable')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {listingT('details.condition')}:
              </span>
              <Badge variant="secondary">
                {listingT(`conditions.${listing.product_condition}`)}
              </Badge>
            </div>
          </div>
        );

      case 'rental':
        return (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-4xl font-bold text-green-500">
                {listing.cost_per_day}€
                <span className="text-lg font-normal text-muted-foreground">
                  {listingT('subtitles.rental')}
                </span>
              </h2>
              {listing.deposit_required && (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700"
                >
                  Deposit Required
                </Badge>
              )}
            </div>
            <div className="rounded-lg bg-muted p-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {listingT('details.maxDuration')}:{' '}
                    <strong>
                      {listing.rental_duration_limit} {listingT('details.days')}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {listingT('details.lateFee')}:{' '}
                    <strong>{listing.late_fee}€</strong>
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {listingT('details.availableUntil')}:{' '}
                    <strong>{formatDate(listing.auto_close_date)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'swap':
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <h3 className="font-semibold text-green-700">
                {listingT('details.lookingToSwap')}:
              </h3>
              <p className="mt-2 text-green-600">{listing.desired_item}</p>
            </div>
          </div>
        );

      case 'giveaway':
        return (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <h3 className="font-semibold text-green-700">
                {listingT('details.recipientRequirements')}:
              </h3>
              <p className="mt-2 text-green-600">
                {listing.recipient_requirements}
              </p>
            </div>
          </div>
        );
    }
  };

  const getActionButtonText = () => {
    switch (listing.listing_type) {
      case 'sale':
        return listingT('actions.buyNow');
      case 'rental':
        return listingT('actions.rentNow');
      case 'swap':
        return listingT('actions.proposeSwap');
      case 'giveaway':
        return listingT('actions.requestItem');
      default:
        return listingT('actions.contactSeller');
    }
  };

  const renderActionButtons = () => {
    const commonProps = {
      product: {
        id: listing.id,
        title: listing.title,
        price:
          listing.listing_type === 'rental'
            ? Number(listing.cost_per_day)
            : listing.listing_type === 'sale'
            ? Number(listing.price)
            : 0,
        image: listing.image_url,
        condition:
          listing.listing_type === 'sale' ? listing.product_condition : 'good',
        owner_id: listing.owner_id,
      },
      onSubmit: (data: CreateProposalDto) => {
        console.log('Proposal submitted:', data);
      },
    };

    switch (listing.listing_type) {
      case 'sale':
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {listing.is_negotiable && (
              <PurchaseProposalDialog
                {...commonProps}
                trigger={
                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  >
                    {listingT('actions.makeOffer')}
                  </Button>
                }
              />
            )}
            <Button
              className={`w-full bg-green-500 font-medium hover:bg-green-600 ${
                !listing.is_negotiable ? 'sm:col-span-2' : ''
              }`}
            >
              {getActionButtonText()}
            </Button>
          </div>
        );

      case 'rental':
        return (
          <RentalProposalDialog
            {...commonProps}
            trigger={
              <Button className="w-full bg-green-500 font-medium hover:bg-green-600">
                {getActionButtonText()}
              </Button>
            }
          />
        );

      case 'swap':
        return (
          <ExchangeProposalDialog
            {...commonProps}
            trigger={
              <Button className="w-full bg-green-500 font-medium hover:bg-green-600">
                {getActionButtonText()}
              </Button>
            }
          />
        );

      case 'giveaway':
        return (
          <Button className="w-full bg-green-500 font-medium hover:bg-green-600">
            {getActionButtonText()}
          </Button>
        );
    }
  };

  // Replace the existing action buttons section with the new render function
  return (
    <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 xl:px-12">
      <div className="space-y-4 xl:px-12">
        <div className="relative overflow-hidden rounded-lg">
          <Carousel className="w-full">
            <CarouselContent>
              {/* Show the main image */}
              <CarouselItem>
                <div className="relative aspect-square overflow-hidden rounded-md">
                  {/* TODO: replace with actual image */}
                  <Image
                    src={
                      listing.image_url ||
                      'https://images.unsplash.com/photo-1621122940876-2b3be129159c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' ||
                      '/placeholder.svg'
                    }
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 500px) 60vw, 25vw"
                    priority
                  />
                </div>
              </CarouselItem>
              {/* Add placeholder slides to demonstrate carousel functionality */}
              <CarouselItem>
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      Additional image would appear here
                    </p>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>

        {/* Thumbnails row */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button className="relative h-16 w-16 overflow-hidden rounded-md border-2 border-green-500">
            <Image
              src={
                listing.image_url ||
                'https://images.unsplash.com/photo-1621122940876-2b3be129159c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }
              alt={listing.title}
              fill
              className="object-cover"
            />
          </button>
          <button className="relative h-16 w-16 overflow-hidden rounded-md border border-muted bg-muted">
            <div className="flex h-full items-center justify-center">
              <span className="text-xs text-muted-foreground">+</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            {listingT(`types.${listing.listing_type}`)}
          </Badge>
          <Badge variant="outline" className="border-muted-foreground/20">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(listing.date_created)}
          </Badge>
          <Badge variant="outline" className="border-muted-foreground/20">
            <MapPin className="mr-1 h-3 w-3" />
            {listingT('details.location')}
          </Badge>
        </div>

        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">
            {listing.title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              className={
                isFavorite ? 'fill-green-500 text-green-500' : 'text-green-500'
              }
              size={20}
            />
            <span className="sr-only">
              {isFavorite
                ? listingT('actions.removeFromFavorites')
                : listingT('actions.addToFavorites')}
            </span>
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <p className="text-sm/relaxed text-muted-foreground">
            {listing.description}
          </p>
        </div>

        {renderListingSpecificInfo()}

        <div className="pt-6">
          <CardContent className="p-0">{renderActionButtons()}</CardContent>
        </div>
      </div>
    </div>
  );
}
