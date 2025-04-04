'use client';

import { useState, useEffect } from 'react';
import ProposalCard from '@/components/proposals/proposal-card';
import type { Proposal } from '@/types/proposal';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import { fetchAllProposals } from '@/lib/api/fetch-user-proposals';
//import { getClientUser } from '@/lib/utils/token/get-client-user';

export function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProposals = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch proposals from API - the API will use cookies for authentication
        const data = await fetchAllProposals();
        setProposals(data);
      } catch (err) {
        console.error('Failed to load proposals:', err);
        setError('Failed to load proposals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposals();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Propostas</h2>
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
        <div>
          <h2 className="text-2xl font-bold">Propostas</h2>
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
        <div>
          <h2 className="text-2xl font-bold">Propostas</h2>
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
      <div>
        <h2 className="text-2xl font-bold">Propostas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}
