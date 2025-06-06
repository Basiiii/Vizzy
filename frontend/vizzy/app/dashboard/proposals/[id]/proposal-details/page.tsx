'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Proposal } from '@/types/proposal';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { Badge } from '@/components/ui/common/badge';
import { Button } from '@/components/ui/common/button';
import { fetchProposalData } from '@/lib/api/proposals/fetch-user-proposals';
import { formatDate, onlyDayMonthYear } from '@/lib/utils/dates';
import { fetchListing } from '@/lib/api/listings/listings';
import { Listing, SaleListing, RentalListing } from '@/types/listing';
import { PurchaseProposalDialog } from '@/components/proposals/purchase-proposal-dialog';
import { RentalProposalDialog } from '@/components/proposals/rental-proposal-dialog';
import { ExchangeProposalDialog } from '@/components/proposals/swap-proposal-dialog';
import { useRouter } from 'next/navigation';
import { CreateProposalDto } from '@/types/create-proposal';
import { GiveawayProposalDialog } from '@/components/proposals/giveaway-proposal-dialog';
import { CancelProposalDialog } from '@/components/proposals/cancel-proposal-dialog';
import { fetchProposalImages } from '@/lib/api/proposals/fetch-proposal-images';
import { updateProposalStatus } from '@/lib/api/proposals/update-proposal-status';
import { getUserAction } from '@/lib/utils/token/get-server-user-action';
import { useTranslations } from 'next-intl';
import ListingCardSmall from '@/components/listings/listing-card-small';
import type { ListingBasic } from '@/types/listing';
import { ImagePreviewDialog } from '@/components/ui/overlay/image-preview-dialog';
import ProfileHoverCard from '@/components/profiles/profile-hover-card';
import { fetchUserProfile } from '@/lib/api/profile/profile';
import { Profile } from '@/types/profile';
// Helper function to transform Listing to ListingBasic
const transformToListingBasic = (listing: Listing): ListingBasic => ({
  id: listing.id,
  title: listing.title,
  type: listing.listing_type,
  price:
    listing.listing_type === 'sale'
      ? (listing as SaleListing).price
      : undefined,
  priceperday:
    listing.listing_type === 'rental'
      ? (listing as RentalListing).cost_per_day
      : undefined,
  image_url: listing.image_url,
  owner_username: listing.owner_username,
});

export default function ProposalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('proposals');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing>();
  const [isSentProposal, setIsSentProposal] = useState(false);
  const [proposalImages, setProposalImages] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [senderProfile, setSenderProfile] = useState<Profile | null>();
  const [receiverProfile, setReceiverProfile] = useState<Profile | null>();

  useEffect(() => {
    const loadProposalDetails = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProposalData(Number(params.id));
        const proposalData = data;
        const currentUser = await getUserAction();

        setIsSentProposal(currentUser?.id === proposalData.data?.sender_id);
        setProposal(proposalData.data || null);
        console.log('Current proposal ID:', proposalData.data?.id);

        // Load images for all proposal types
        try {
          const imagesResult = await fetchProposalImages(Number(params.id));
          if (imagesResult.data && Array.isArray(imagesResult.data)) {
            setProposalImages(
              imagesResult.data.map((img) => img.url).filter(Boolean),
            );
          } else {
            setProposalImages([]);
          }
        } catch (imageError) {
          console.error('Failed to load proposal images:', imageError);
          setProposalImages([]);
        }

        if (proposalData.data?.listing_id) {
          try {
            const listingData = await fetchListingDetails(
              proposalData.data?.listing_id,
            );
            setListing(listingData.data || undefined);
          } catch (listingError) {
            console.error('Failed to load listing:', listingError);
          }
        }
      } catch (err) {
        console.error('Failed to load proposal details:', err);
        setError('Failed to load proposal details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) {
      loadProposalDetails();
    }
  }, [params.id, refreshKey]);

  useEffect(() => {
    async function loadProfiles() {
      if (proposal) {
        const senderResult = await fetchUserProfile(proposal.sender_username);
        if (senderResult.data) {
          senderResult.data.username = proposal.sender_username;
        }
        setSenderProfile(senderResult.data || null);
        const receiverResult = await fetchUserProfile(
          proposal.receiver_username,
        );
        if (receiverResult.data) {
          receiverResult.data.username = proposal.receiver_username;
        }
        setReceiverProfile(receiverResult.data || null);
      }
    }
    loadProfiles();
  }, [proposal]);

  if (isLoading) {
    return <ProposalDetailsSkeleton />;
  }

  if (error || !proposal) {
    return <ErrorState error={error} />;
  }
  console.log('Proposal DETAILS:', proposal);
  const renderProposalSpecificInfo = (proposal: Proposal) => {
    switch (proposal.proposal_type) {
      case 'swap':
        return (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-4">
                {t('proposalDetails.title')}
              </h2>
              <p className="text-muted-foreground">{proposal.description}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('proposalDetails.swapWith')}
                  </p>
                  <p className="font-bold">{proposal.swap_with}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {t('proposalDetails.proposalFrom')}
                  </p>
                  {senderProfile && (
                    <ProfileHoverCard profile={senderProfile} />
                  )}
                </div>
              </div>
            </section>

            {proposalImages.length > 0 && (
              <section className="mt-6">
                <h2 className="text-lg font-semibold mb-4">
                  {t('proposalDetails.proposalImages')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {proposalImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="group aspect-square bg-muted rounded-lg overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setPreviewOpen(true);
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Anexo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm">
                          {t('proposalDetails.viewImage')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        );

      case 'sale':
        return (
          <section>
            <h2 className="text-lg font-semibold mb-4">
              {t('proposalDetails.title')}
            </h2>
            <p className="text-muted-foreground">{proposal.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('proposalDetails.offeredPrice')}
                </p>
                <p className="font-bold">
                  €{proposal.offered_price?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {t('proposalDetails.proposalFrom')}
                </p>
                {senderProfile && <ProfileHoverCard profile={senderProfile} />}
              </div>
            </div>
          </section>
        );

      case 'rental':
        return (
          <section>
            <h2 className="text-lg font-semibold mb-4">
              {t('proposalDetails.title')}
            </h2>
            <p className="text-muted-foreground">{proposal.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('proposalDetails.valuePerDay')}
                </p>
                <p className="font-bold">
                  €{proposal.offered_rent_per_day?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('proposalDetails.rentalPeriod')}
                </p>
                <p className="font-medium">
                  {proposal.start_date &&
                    onlyDayMonthYear(proposal.start_date.toString())}{' '}
                  -{' '}
                  {proposal.end_date &&
                    onlyDayMonthYear(proposal.end_date.toString())}
                </p>
              </div>
              {proposal.start_date &&
                proposal.end_date &&
                proposal.offered_rent_per_day && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('proposalDetails.totalValue')} (
                      {calculateTotalRentalDays(
                        proposal.start_date.toString(),
                        proposal.end_date.toString(),
                      )}{' '}
                      {t('proposalDetails.days')})
                    </p>
                    <p className="font-bold text-lg">
                      €
                      {(
                        calculateTotalRentalDays(
                          proposal.start_date.toString(),
                          proposal.end_date.toString(),
                        ) * proposal.offered_rent_per_day
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {t('proposalDetails.proposalFrom')}
                </p>
                {senderProfile && <ProfileHoverCard profile={senderProfile} />}
              </div>
            </div>
          </section>
        );

      case 'giveaway':
        return (
          <section>
            <h2 className="text-lg font-semibold mb-4">
              {t('proposalDetails.title')}
            </h2>
            <p className="text-muted-foreground">{proposal.description}</p>
            <div className="text-right mt-4">
              <p className="text-sm text-muted-foreground">
                {t('proposalDetails.proposalFrom')}
              </p>
              {senderProfile && <ProfileHoverCard profile={senderProfile} />}
            </div>
          </section>
        );

      default:
        return null;
    }
  };
  const handleCounterProposal = (data: CreateProposalDto) => {
    // Handle the counter proposal submission
    console.log('Counter proposal submitted:', data);
    router.refresh();
  };

  const handleBack = () => {
    router.push('/dashboard?activeTab=proposals');
  };

  const handleCancelProposal = async () => {
    // TODO: Implement cancel proposal API call
    console.log('Canceling proposal:', proposal?.id);
  };

  const handleAcceptProposal = async () => {
    try {
      await updateProposalStatus('accepted', proposal.id);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error accepting proposal:', error);
    }
  };

  const handleRejectProposal = async () => {
    try {
      await updateProposalStatus('rejected', proposal.id);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error accepting proposal:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Updated Back button */}
      <button
        onClick={handleBack}
        className="flex items-center text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
      >
        <span>{t('back')}</span>
      </button>

      <div className="space-y-6">
        {/* Title and Status */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{proposal?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(proposal?.created_at)}
            </p>
          </div>
          <Badge variant={getStatusVariant(proposal?.proposal_status || '')}>
            {proposal?.proposal_status &&
              t(`status.${proposal.proposal_status}`)}
          </Badge>
        </div>

        {/* Type-specific proposal information */}
        {proposal && renderProposalSpecificInfo(proposal)}

        {/* Listing Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">
            {t('proposalDetails.listingInfo.title')}
          </h2>
          {listing && (
            <ListingCardSmall listing={transformToListingBasic(listing)} />
          )}
          <div className="mt-4 text-right">
            <p className="text-sm text-muted-foreground">
              {t('proposalDetails.listingInfo.listingFrom')}
            </p>
            {receiverProfile && <ProfileHoverCard profile={receiverProfile} />}
          </div>
        </section>
        <div className="container mx-auto p-6">
          {/* Action Buttons */}
          {proposal.proposal_status === 'pending' && (
            <div className="flex justify-center mt-6">
              {!isSentProposal ? (
                <div className="flex gap-4 w-full">
                  <Button
                    variant="default"
                    className="flex-1 bg-brand-500"
                    onClick={handleAcceptProposal}
                  >
                    ✓ {t('proposalDetails.actionButtons.acceptProposal')}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleRejectProposal}
                  >
                    ✕ {t('proposalDetails.actionButtons.rejectProposal')}
                  </Button>
                  {listing &&
                    (listing.listing_type === 'sale' ? (
                      <PurchaseProposalDialog
                        product={{
                          id: listing.id,
                          title: listing.title,
                          price: Number(listing.price),
                          image: listing.image_url,
                          condition: (listing as SaleListing).product_condition,
                        }}
                        onSubmit={handleCounterProposal}
                        trigger={
                          <Button variant="outline" className="flex-1">
                            ↺{' '}
                            {t(
                              'proposalDetails.actionButtons.makeCounterProposal',
                            )}
                          </Button>
                        }
                        receiver_id={proposal.sender_id}
                      />
                    ) : listing.listing_type === 'rental' ? (
                      <RentalProposalDialog
                        product={{
                          id: listing.id,
                          title: listing.title,
                          price: Number(
                            (listing as RentalListing).cost_per_day,
                          ),
                          image: listing.image_url,
                          condition: '',
                        }}
                        onSubmit={handleCounterProposal}
                        trigger={
                          <Button variant="outline" className="flex-1">
                            ↺{' '}
                            {t(
                              'proposalDetails.actionButtons.makeCounterProposal',
                            )}
                          </Button>
                        }
                        receiver_id={proposal.sender_id}
                      />
                    ) : listing.listing_type === 'swap' ? (
                      <ExchangeProposalDialog
                        product={{
                          id: listing.id,
                          title: listing.title,
                          price: 0,
                          image: listing.image_url,
                          condition: '',
                        }}
                        onSubmit={handleCounterProposal}
                        trigger={
                          <Button variant="outline" className="flex-1">
                            ↺{' '}
                            {t(
                              'proposalDetails.actionButtons.makeCounterProposal',
                            )}
                          </Button>
                        }
                        receiver_id={proposal.sender_id}
                      />
                    ) : listing.listing_type === 'giveaway' ? (
                      <GiveawayProposalDialog
                        product={{
                          id: listing.id,
                          title: listing.title,
                          price: 0,
                          image: listing.image_url,
                          condition: '',
                        }}
                        onSubmit={handleCounterProposal}
                        trigger={
                          <Button variant="outline" className="flex-1">
                            ↺{' '}
                            {t(
                              'proposalDetails.actionButtons.makeCounterProposal',
                            )}
                          </Button>
                        }
                        receiver_id={proposal.sender_id}
                      />
                    ) : null)}
                </div>
              ) : (
                <CancelProposalDialog
                  proposalId={proposal.id}
                  onConfirm={handleCancelProposal}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add the ImagePreviewDialog */}
      <ImagePreviewDialog
        images={proposalImages}
        initialIndex={selectedImageIndex}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}

function ProposalDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string | null }) {
  const t = useTranslations('proposals.proposalDetails');
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-destructive">
        {error || 'Failed to load proposal'}
      </h3>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        {t('proposalDetails.tryAgain')}
      </Button>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'pending';
    case 'accepted':
      return 'accepted';
    case 'rejected':
      return 'rejected';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'secondary';
  }
}
const fetchListingDetails = async (listingId: string) => {
  try {
    const listingData = await fetchListing(listingId);
    console.log('Listing data:', listingData);
    return listingData;
  } catch (error) {
    console.error('Failed to load listing:', error);
    throw error;
  }
};
const calculateTotalRentalDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};
