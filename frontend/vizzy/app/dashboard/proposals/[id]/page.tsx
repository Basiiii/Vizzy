'use client';

import { useState, useEffect } from 'react';
import { Proposal } from '@/types/proposal';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import ProposalCard from '@/components/proposals/proposal-card';
import {
  fetchSentProposals,
  fetchReceivedProposals,
} from '@/lib/api/proposals/fetch-user-proposals';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<
    'received' | 'sent' | 'accepted' | 'rejected' | 'canceled'
  >('received');

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          viewType === 'received'
            ? await fetchReceivedProposals()
            : await fetchSentProposals();

        setProposals(data);
      } catch (err) {
        console.error('Failed to load proposals:', err);
        setError('Failed to load proposals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, [viewType]); // Re-fetch when viewType changes

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Propostas</h2>
          <div className="flex gap-2">
            <Select disabled>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="View Type" />
              </SelectTrigger>
            </Select>
          </div>
        </div>

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

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Propostas</h2>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button
            className="mt-2 text-red-700 underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Propostas</h2>
        <div className="flex gap-2">
          <Select
            value={viewType}
            onValueChange={(
              value: 'received' | 'sent' | 'accepted' | 'rejected' | 'canceled',
            ) => setViewType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="received">Received Proposals</SelectItem>
              <SelectItem value="sent">Sent Proposals</SelectItem>
              <SelectItem value="accepted">Accepted Proposals</SelectItem>
              <SelectItem value="rejected">Rejected Proposals</SelectItem>
              <SelectItem value="canceled">Canceled Proposals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.proposal_id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}
