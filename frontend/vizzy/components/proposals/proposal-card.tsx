'use client';

import { Card, CardContent } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/common/badge';
import { Button } from '@/components/ui/common/button';
import Link from 'next/link';
import type { Proposal } from '@/types/proposal';
import { CardFooter } from '@/components/ui/data-display/card';
import { formatDate } from '@/lib/utils/dates';
import { useTranslations } from 'next-intl';

interface ProposalCardProps {
  proposal: Proposal;
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  console.log('ProposalCard:', proposal.id);
  const t = useTranslations('proposals');

  // Function to render the appropriate badge based on status
  const renderStatusBadge = (status: Proposal['proposal_status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-white text-black font-medium">
            {t('status.pending')}
          </Badge>
        );
      case 'accepted':
        return (
          <Badge
            variant="secondary"
            className="bg-green-500 text-white font-medium"
          >
            {t('status.accepted')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="font-medium">
            {t('status.rejected')}
          </Badge>
        );
      case 'cancelled':
        return <Badge variant="cancelled">{t('status.cancelled')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="border border-border/40 py-0">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{proposal.title}</h3>
            <p className="text-sm text-muted-foreground">
              {t('fromLabel')}: {proposal.sender_name} •{' '}
              {formatDate(proposal.created_at)}
            </p>
          </div>
          {renderStatusBadge(proposal.proposal_status)}
        </div>

        <p className="text-sm">{proposal.message}</p>

        <div>
          <p className="text-sm font-medium">
            {t('listingLabel')}: {proposal.listing_title}
          </p>
        </div>

        <CardFooter>
          <Link
            href={`/dashboard/proposals/${proposal.id}/proposal-details`}
            className="w-full"
          >
            <Button variant="outline" className="w-full cursor-pointer">
              {t('detailsButton')}
            </Button>
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
