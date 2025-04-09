'use client';

import { useState, useEffect } from 'react';
import ProposalCard from '@/components/proposals/proposal-card';
import type { Proposal } from '@/types/proposal';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { fetchReceivedProposals, fetchSentProposals } from '@/lib/api/fetch-user-proposals';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { formatDate } from '@/lib/utils/dates';

export function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching proposals for view type:', viewType);
        const data = viewType === 'received' 
          ? await fetchReceivedProposals()
          : await fetchSentProposals();
        
        console.log('Raw data:', data);
        
        const formattedProposals = data.map((item) => ({
          id: Number(item.id),
          title: item.title || undefined,
          description: item.description,
          sender_id: item.sender_id || undefined,
          sender_name: item.sender_name || undefined,
          receiver_id: item.receiver_id || undefined,
          listing_id: item.listing_id,
          listing_title: item.listing_title || undefined,
          proposal_type: item.proposal_type,
          proposal_status: item.proposal_status,
          created_at: formatDate(item.created_at),
          offered_rent_per_day: item.offered_rent_per_day,
          start_date: item.start_date ? new Date(item.start_date) : undefined,
          end_date: item.end_date ? new Date(item.end_date) : undefined,
          offered_price: item.offered_price,
          swap_with: item.swap_with,
          message: item.message
        }));

        console.log('Formatted proposals:', formattedProposals);
        setProposals(formattedProposals);
      } catch (err) {
        console.error('Error loading proposals:', err);
        setError('Failed to load proposals. Please try again later.');
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Propostas</h2>
          <Select disabled>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View Type" />
            </SelectTrigger>
          </Select>
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

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Propostas</h2>
          <Select disabled>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View Type" />
            </SelectTrigger>
          </Select>
        </div>

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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Propostas</h2>
          <Select value={viewType} onValueChange={(value: 'received' | 'sent') => setViewType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="received">Received Proposals</SelectItem>
              <SelectItem value="sent">Sent Proposals</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Propostas</h2>
        <Select value={viewType} onValueChange={(value: 'received' | 'sent') => setViewType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="received">Received Proposals</SelectItem>
            <SelectItem value="sent">Sent Proposals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}
