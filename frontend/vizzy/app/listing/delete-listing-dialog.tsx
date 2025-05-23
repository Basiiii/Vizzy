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
import { deleteListing } from '@/lib/api/listings/delete-listing';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface DeleteListingDialogProps {
  listingId: number;
}

export function DeleteListingDialog({ listingId }: DeleteListingDialogProps) {
  const router = useRouter();
  const t = useTranslations('listing');

  const handleDelete = async () => {
    try {
      await deleteListing(listingId);

      router.refresh();

      await new Promise((resolve) => setTimeout(resolve, 500));

      window.location.href = `/dashboard?activeTab=listings&t=${Date.now()}`;

      toast.success(t('toast.deleteSuccess'));
    } catch (error) {
      toast.error(t('toast.deleteError'));
      console.error('Error deleting listing:', error);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title={t('actions.delete')}
          className="h-8 w-8 rounded-full cursor-pointer dark:hover:bg-red-950/80 hover:bg-red-200/80"
        >
          <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
          <span className="sr-only">{t('actions.delete')}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            {t('deleteDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
