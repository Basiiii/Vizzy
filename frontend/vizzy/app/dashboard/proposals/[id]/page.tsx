'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/common/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Separator } from '@/components/ui/layout/separator';
import Link from 'next/link';
import Image from 'next/image';
import { PurchaseProposalDialog } from '@/components/proposals/purchase-proposal-dialog';
import { RentalProposalDialog } from '@/components/proposals/rental-proposal-dialog';
import { ExchangeProposalDialog } from '@/components/proposals/swap-proposal-dialog';

// Mock data for the proposal details
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

export default function ProposalDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [proposal] = useState(proposalDetails);
  const hasImages = proposal.images && proposal.images.length > 0;

  const handleProposalSubmit = (data: any) => {
    console.log('Proposal submitted:', data);
    // Here you would typically send the data to your API
    alert('Proposta enviada com sucesso!');
  };

  // Function to render the appropriate dialog based on listing type
  const renderCounterProposalDialog = () => {
    const product = {
      id: proposal.listing.id,
      title: proposal.listing.title,
      price: proposal.listing.price,
      image: proposal.listing.image,
      condition: proposal.listing.condition,
    };

    const buttonTrigger = (
      <Button variant="outline" className="flex-1">
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Contra Proposta
      </Button>
    );

    switch (proposal.listing.type) {
      case 'rental':
        return (
          <RentalProposalDialog
            product={product}
            onSubmit={handleProposalSubmit}
            trigger={buttonTrigger}
          />
        );
      case 'swap':
        return (
          <ExchangeProposalDialog
            product={product}
            onSubmit={handleProposalSubmit}
            trigger={buttonTrigger}
          />
        );
      case 'sale':
      case 'giveaway':
      default:
        return (
          <PurchaseProposalDialog
            product={product}
            onSubmit={handleProposalSubmit}
            trigger={buttonTrigger}
          />
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard"
        className="flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar às propostas
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <p className="text-sm text-muted-foreground">
            Proposta #{params.id} • {proposal.date}
          </p>
        </div>
        <Badge variant="outline" className="bg-white text-black font-medium">
          Pendente
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Informações da Proposta
          </h2>
          <p className="mb-4">{proposal.message}</p>

          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Proposta</p>
              <p className="text-lg font-bold">€ {proposal.value.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Proposta De</p>
              <p className="font-medium">{proposal.sender}</p>
            </div>
          </div>
        </div>

        {hasImages && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-semibold mb-4">Imagens em Anexo</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {proposal.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-muted rounded-md overflow-hidden"
                  >
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`Imagem ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div>
          <h2 className="text-lg font-semibold mb-2">Informações do Anúncio</h2>
          <p className="mb-4">{proposal.listing.description}</p>

          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Anúncio</p>
              <p className="text-lg font-bold">
                € {proposal.listing.price.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Anúncio De</p>
              <p className="font-medium">{proposal.listing.seller}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12L9 16L19 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Aceitar Proposta
          </Button>
          <Button variant="destructive" className="flex-1">
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Rejeitar Proposta
          </Button>
          {renderCounterProposalDialog()}
        </div>
      </div>
    </div>
  );
}
