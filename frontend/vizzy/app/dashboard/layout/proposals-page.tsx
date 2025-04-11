'use client';

import { useState, useEffect } from 'react';
import ProposalCard from '@/components/proposals/proposal-card';
import type { Proposal } from '@/types/proposal';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import {
  fetchReceivedProposals,
  fetchSentProposals,
  fetchUserProposalsByStatus,
} from '@/lib/api/proposals/fetch-user-proposals';
import { formatDate } from '@/lib/utils/dates';

interface ProposalsPageProps {
  viewType: 'received' | 'sent' | 'accepted' | 'rejected';
}

export function ProposalsPage({ viewType }: ProposalsPageProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let data;
        if (viewType === 'accepted' || viewType === 'rejected') {
          data = await fetchUserProposalsByStatus(viewType);
        } else {
          data =
            viewType === 'received'
              ? await fetchReceivedProposals()
              : await fetchSentProposals();
        }

        // Cast the formatted data to Proposal[] to ensure type compatibility
        // TODO: corrigir isto, nao podemos estar a usar any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedProposals = data.map((item: any) => ({
          proposal_id: Number(item.proposal_id),
          title: item.title || '',
          description: item.description,
          sender_id: item.sender_id || '',
          sender_name: item.sender_name,
          receiver_id: item.receiver_id || '',
          listing_id: item.listing_id,
          receiver_name: item.receiver_name,
          listing_title: item.listing_title,
          proposal_type: item.proposal_type,
          proposal_status: item.proposal_status,
          created_at: formatDate(item.created_at),
          offered_rent_per_day: item.offered_rent_per_day
            ? Number(item.offered_rent_per_day)
            : null,
          start_date: item.start_date ? new Date(item.start_date) : null,
          end_date: item.end_date ? new Date(item.end_date) : null,
          offered_price: item.offered_price ? Number(item.offered_price) : null,
          swap_with: item.swap_with || '',
          message: item.message || '',
        })) as Proposal[];

        setProposals(formattedProposals);
      } catch (error) {
        console.error('Error loading proposals:', error);
        setError('Failed to load proposals');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, [viewType]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
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
          <button
            className="mt-2 text-red-700 underline"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (proposals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium">Você não tem propostas</h3>
          <p className="text-muted-foreground mt-1">
            Quando você receber propostas, elas aparecerão aqui
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.proposal_id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}
