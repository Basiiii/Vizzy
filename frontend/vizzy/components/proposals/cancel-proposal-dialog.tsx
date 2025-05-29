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
import { cancelProposal } from '@/lib/api/proposals/cancel-proposal';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface CancelProposalDialogProps {
  proposalId: number;
  onConfirm?: () => void;
}

export function CancelProposalDialog({
  proposalId,
  onConfirm,
}: CancelProposalDialogProps) {
  const t = useTranslations('proposalDialogs');
  console.log('Dialog opened with proposalId:', proposalId);
  const handleCancel = async () => {
    try {
      await cancelProposal(proposalId);
      console.log(`Proposal ${proposalId} status updated to cancelled.`);
      toast.success(t('cancelDialog.toast.proposalCancelled'), {
        description: t('cancelDialog.toast.proposalCancelledDescription'),
        duration: 4000,
      });
      onConfirm?.();
      window.location.reload();
    } catch (error) {
      console.error('Error canceling proposal:', error);
      toast.error(t('cancelDialog.toast.proposalCancelledError'), {
        description: t('cancelDialog.toast.proposalCancelledErrorDescription'),
        duration: 4000,
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-1/4">
          <Trash2 className="h-4 w-4 mr-2" />
          {t('cancelDialog.title')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('cancelDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('cancelDialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancelDialog.goBack')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>
            {t('cancelDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
