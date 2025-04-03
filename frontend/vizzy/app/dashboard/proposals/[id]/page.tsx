'use client';

import { useState, useEffect } from 'react';
import { Proposal } from '@/types/proposal';
import { Skeleton } from '@/components/ui/data-display/skeleton';
import ProposalCard from '@/components/proposals/proposal-card';
import { fetchAllProposals } from '@/lib/api/fetch-user-proposals';

/* // Mock data for the proposal details
const proposalDetails = {
  id: '123456',
  title: 'Comprar Corta-Relvas',
  sender: 'José Alves',
  date: '25 Fev, 2025',
  message:
    'Estou interessado em comprar o corta-relvas que está à venda. Aceita 150€?',
  value: 150.0,
  status: 'pendente',
  listing: {
    id: '789012',
    title: 'Corta-Relvas',
    description:
      'Vendo cortador de relvas em ótimo estado, funciona super bem e é fácil de usar. Ideal para manter o jardim sempre bonito sem muito esforço. Só estou a vender porque troquei por um modelo maior. Posso entregar na região ou combinar a retirada.',
    price: 199.99,
    seller: 'Enrique Rodrigues',
    image: '/placeholder.svg?height=150&width=150',
    condition: 'Como Novo',
    type: 'sale', // can be 'sale', 'rental', 'swap', or 'giveaway'
  },
  images: [
    '/placeholder.svg?height=150&width=150',
    '/placeholder.svg?height=150&width=150',
    '/placeholder.svg?height=150&width=150',
    '/placeholder.svg?height=150&width=150',
  ],
};
 */

const proposalsData = fetchAllProposals();

export function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with timeout
    const loadProposals = async () => {
      try {
        setIsLoading(true);

        // In a real app, you would fetch from an API
        // For now, we'll use the JSON data with a timeout to simulate loading
        setTimeout(() => {
          setProposals(proposalsData);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to load proposals:', err);
        setError('Failed to load proposals. Please try again later.');
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
