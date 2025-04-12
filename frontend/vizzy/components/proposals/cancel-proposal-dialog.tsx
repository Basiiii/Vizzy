'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/overlay/alert-dialog';
import { Button } from '@/components/ui/common/button';
import { Trash2 } from 'lucide-react';
import { updateProposalStatus } from '@/lib/api/proposals/update-proposal-status';

interface CancelProposalDialogProps {
  proposalId: number;
  onConfirm?: () => void;
}

export function CancelProposalDialog({ proposalId, onConfirm }: CancelProposalDialogProps) {
  console.log('Dialog opened with proposalId:', proposalId);
  const handleCancel = async () => {
    try {
      await updateProposalStatus('cancelled', proposalId);
      onConfirm?.();
      console.log(`proposalID: ${proposalId}`)
    } catch (error) {
      console.error('Error canceling proposal:', error);
      // You might want to add toast notification here
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-1/4">
          <Trash2 className="h-4 w-4 mr-2" />
          Cancelar Proposta
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Proposta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem a certeza que pretende cancelar esta proposta? Esta ação não pode
            ser revertida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}