'use client';

import { Button } from '@/components/ui/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/common/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/data-display/dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteAccountAction } from '@/lib/actions/auth/delete-account-action';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes/routes';
import { useTranslations } from 'next-intl';

export default function AccountSettings() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const t = useTranslations('accountSettings.accountTab');
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteAccountAction();

      if (result.success) {
        toast('Account deleted successfully.');
        router.push(ROUTES.HOME);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast('Failed to delete account. Please try again.');
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteAccountButton')}</DialogTitle>
            <DialogDescription>
              {t('deleteAccountDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? t('deleting') : t('deleteAccountButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t('account')}</h3>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        {/* TODO: Implement password update */}
        <form>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('password')}</CardTitle>
              <CardDescription>{t('passwordDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">{t('currentPassword')}</Label>
                <Input disabled id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">{t('newPassword')}</Label>
                <Input disabled id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t('confirmPassword')}</Label>
                <Input disabled id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>{t('changePassword')}</Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t('dangerZone')}
            </CardTitle>
            <CardDescription>{t('dangerZoneDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4"></p>
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {t('deleteAccountButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
