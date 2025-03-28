'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/common/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Card, CardContent } from '@/components/ui/data-display/card';
import Link from 'next/link';

// Define the Proposal type
interface Proposal {
  id: string;
  title: string;
  sender: string;
  date: string;
  description: string;
  status: 'pendente' | 'aceite' | 'rejeitado';
  listingTitle: string;
}

// Sample data to match the image
const sampleProposals: Proposal[] = [
  {
    id: '123456',
    title: 'Comprar Corta-Relvas',
    sender: 'José Alves',
    date: '25 Fev, 2025',
    description:
      'Estou interessado em comprar o corta-relvas que está à venda. Poderia fornecer mais informações sobre o modelo,...',
    status: 'pendente',
    listingTitle: 'Corta-Relvas',
  },
  {
    id: '123457',
    title: 'Comprar Corta-Relvas',
    sender: 'José Alves',
    date: '25 Fev, 2025',
    description:
      'Estou interessado em comprar o corta-relvas que está à venda. Poderia fornecer mais informações sobre o modelo,...',
    status: 'aceite',
    listingTitle: 'Corta-Relvas',
  },
  {
    id: '123458',
    title: 'Comprar Corta-Relvas',
    sender: 'José Alves',
    date: '25 Fev, 2025',
    description:
      'Estou interessado em comprar o corta-relvas que está à venda. Poderia fornecer mais informações sobre o modelo,...',
    status: 'rejeitado',
    listingTitle: 'Corta-Relvas',
  },
  {
    id: '123459',
    title: 'Comprar Corta-Relvas',
    sender: 'José Alves',
    date: '25 Fev, 2025',
    description:
      'Estou interessado em comprar o corta-relvas que está à venda. Poderia fornecer mais informações sobre o modelo,...',
    status: 'pendente',
    listingTitle: 'Corta-Relvas',
  },
  {
    id: '123460',
    title: 'Comprar Corta-Relvas',
    sender: 'José Alves',
    date: '25 Fev, 2025',
    description:
      'Estou interessado em comprar o corta-relvas que está à venda. Poderia fornecer mais informações sobre o modelo,...',
    status: 'pendente',
    listingTitle: 'Corta-Relvas',
  },
  {
    id: '123461',
    title: 'Comprar Corta-Relvas',
    sender: 'José Alves',
    date: '25 Fev, 2025',
    description:
      'Estou interessado em comprar o corta-relvas que está à venda. Poderia fornecer mais informações sobre o modelo,...',
    status: 'pendente',
    listingTitle: 'Corta-Relvas',
  },
];

export function ProposalsPage() {
  const [proposals] = useState<Proposal[]>(sampleProposals);

  // Function to render the appropriate badge based on status
  const renderStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'pendente':
        return (
          <Badge variant="outline" className="bg-white text-black font-medium">
            Pendente
          </Badge>
        );
      case 'aceite':
        return (
          <Badge
            variant="secondary"
            className="bg-green-500 text-white font-medium"
          >
            Aceite
          </Badge>
        );
      case 'rejeitado':
        return (
          <Badge variant="destructive" className="font-medium">
            Rejeitado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Propostas</h2>
        <Button variant="outline" className="font-medium">
          Filtrar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="border border-border/40">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{proposal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    De: {proposal.sender} • {proposal.date}
                  </p>
                </div>
                {renderStatusBadge(proposal.status)}
              </div>

              <p className="text-sm">{proposal.description}</p>

              <div>
                <p className="text-sm font-medium">
                  Anúncio: {proposal.listingTitle}
                </p>
              </div>

              <Link href={`/dashboard/proposals/${proposal.id}`}>
                <Button variant="outline" className="w-full">
                  Ver Detalhes
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
