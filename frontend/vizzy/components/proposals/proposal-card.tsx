import { Card, CardContent } from '@/components/ui/data-display/card';
import { Badge } from '@/components/ui/data-display/badge';
import { Button } from '@/components/ui/common/button';
import Link from 'next/link';
import type { Proposal } from '@/types/proposal';

interface ProposalCardProps {
  proposal: Proposal;
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  // Function to render the appropriate badge based on status
  const renderStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-white text-black font-medium">
            Pendente
          </Badge>
        );
      case 'Accepted':
        return (
          <Badge
            variant="secondary"
            className="bg-green-500 text-white font-medium"
          >
            Aceite
          </Badge>
        );
      case 'Rejected':
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
    <Card className="border border-border/40">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{proposal.title}</h3>
            <p className="text-sm text-muted-foreground">
              De: {proposal.sender_name} • {proposal.created_at}
            </p>
          </div>
          {renderStatusBadge(proposal.status)}
        </div>

        <p className="text-sm">{proposal.message}</p>

        <div>
          <p className="text-sm font-medium">
            Anúncio: {proposal.linting_title}
          </p>
        </div>

        <Link href={`/dashboard/proposals/${proposal.id}`}>
          <Button variant="outline" className="w-full">
            Ver Detalhes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
