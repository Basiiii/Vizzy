'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Proposal } from '@/types/proposal';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { Badge } from '@/components/ui/common/badge';
import { Button } from '@/components/ui/common/button';
import { fetchProposalData } from '@/lib/api/fetch-user-proposals';

export default function ProposalDetailsPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProposalDetails = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProposalData(Number(params.id));
        setProposal(data);
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
  }, [params.id]);

  if (isLoading) {
    return <ProposalDetailsSkeleton />;
  }

  if (error || !proposal) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{proposal.title}</h2>
        <Badge variant={getStatusVariant(proposal.proposal_status)}>
          {proposal.proposal_status}
        </Badge>
      </div>

      <div className="grid gap-6">
        <div className="bg-card rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold mb-2">Informações da Proposta</h3>
              <p className="text-muted-foreground">{proposal.message}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor Proposta</p>
              <p className="text-xl font-bold">
                {proposal.offered_price ? `€${proposal.offered_price.toFixed(2)}` : 'N/A'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {proposal.sender_id === proposal.receiver_id ? 'From:' : 'Product Owner'}
            </p>
            <p className="font-medium">{proposal.sender_name || proposal.receiver_name}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Informações do Anúncio</h3>
          <p className="text-muted-foreground">{proposal.listing_title}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Created at: {proposal.created_at}
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="default" className="flex-1">
            Aceitar Proposta
          </Button>
          <Button variant="destructive" className="flex-1">
            Rejeitar Proposta
          </Button>
          <Button variant="outline" className="flex-1">
            Contra Proposta
          </Button>
        </div>
      </div>
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
        Try Again
      </Button>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
}