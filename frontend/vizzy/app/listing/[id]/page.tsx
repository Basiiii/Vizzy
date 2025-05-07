'use client';

import { use, useEffect, useState } from 'react';
import { Calendar, Heart, Info, MapPin, Tag } from 'lucide-react';
import Image from 'next/image';
import type { Listing } from '@/types/listing';
import { fetchListing } from '@/lib/api/listings/listings';
import { fetchListingImages } from '@/lib/api/listings/fetch-listing-images';
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
import { CreateProposalDto } from '@/types/create-proposal';
import { GiveawayProposalDialog } from '@/components/proposals/giveaway-proposal-dialog';
import { BuyNowDialog } from '@/components/proposals/buy-now-dialog';
import ProfileCard from '@/components/profiles/profile-card';
import { fetchUserProfile } from '@/lib/api/profile/profile';
import type { Profile } from '@/types/profile';

export default function ProductListing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [isMounted, setIsMounted] = useState(false);

  const { id } = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [listingImages, setListingImages] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
  const listingT = useTranslations('listing');

  useEffect(() => {
    const getListingData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchListing(id);
        setListing(data.data);

        if (data.data) {
          try {
            const imageDtosResult = await fetchListingImages(parseInt(id));

            const imageUrls = imageDtosResult.data
              ? imageDtosResult.data.map((dto) => dto.url).filter(Boolean)
              : [];

            const mainImage = data.data.image_url;
            const allImages = mainImage
              ? [mainImage, ...imageUrls.filter((url) => url !== mainImage)]
              : imageUrls;

            console.log('Fetched images:', allImages);
            setListingImages(allImages);

            if (data.data.owner_username) {
              const profileResult = await fetchUserProfile(
                data.data.owner_username,
              );
              if (profileResult.data) {
                profileResult.data.username = data.data.owner_username;
                setOwnerProfile(profileResult.data);
              }
            }
          } catch (imageError) {
            console.error('Error fetching listing images:', imageError);
            setListingImages(data.data.image_url ? [data.data.image_url] : []);
          }
        }
      } catch (error) {
        console.error('Error fetching listing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getListingData();
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
                receiver_id={listing.owner_id}
              />
            )}
            <BuyNowDialog
              {...commonProps}
              trigger={
                <Button className="w-full bg-green-500 font-medium hover:bg-green-600">
                  {getActionButtonText()}
                </Button>
              }
              receiver_id={listing.owner_id}
            />
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
            receiver_id={listing.owner_id}
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
            receiver_id={listing.owner_id}
          />
        );

      case 'giveaway':
        return (
          <GiveawayProposalDialog
            {...commonProps}
            trigger={
              <Button className="w-full bg-green-500 font-medium hover:bg-green-600">
                {getActionButtonText()}
              </Button>
            }
            receiver_id={listing.owner_id}
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 xl:px-12">
      <div className="space-y-4 xl:px-12">
        <div className="relative overflow-hidden rounded-lg">
          <Carousel className="w-full max-w-3xl mx-auto">
            <CarouselContent>
              {listingImages.length > 0 ? (
                listingImages.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-square overflow-hidden rounded-md">
                      <Image
                        src={imageUrl || '/placeholder.svg'}
                        alt={`${listing?.title || 'Listing'} image ${
                          index + 1
                        }`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 400px"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                // Fallback if no images are found (even after fetch)
                <CarouselItem>
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <Image
                        src={'/placeholder.svg'}
                        alt="Placeholder image"
                        fill
                        className="object-contain p-8 text-muted-foreground" // Use contain for placeholder
                      />
                    </div>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {listingImages.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>

        {/* Thumbnails row - Map over images */}
        {listingImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {listingImages.map((imageUrl, index) => (
              <button
                key={index}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border ${
                  index === 0 ? 'border-green-500' : 'border-muted'
                }`}
              >
                <Image
                  src={imageUrl || '/placeholder.svg'}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
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

        {/* Owner Profile Card */}
        {ownerProfile && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">
              {listingT('details.sellerInfo')}
            </h2>
            <ProfileCard profile={ownerProfile} />
          </div>
        )}
      </div>
    </div>
  );
}
