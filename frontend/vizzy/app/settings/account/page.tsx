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
import { deleteAccount } from '@/lib/api/auth/actions/delete-account';
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
import { useTranslations } from 'next-intl';

export default function AccountSettings() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations('settings.account');
  const commonT = useTranslations('accountPageCommon');

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      toast(t('dangerZone.deleteAccount.toast.success'));
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast(t('dangerZone.deleteAccount.toast.error'));
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dangerZone.deleteAccount.confirmDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('dangerZone.deleteAccount.confirmDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {t('dangerZone.deleteAccount.confirmDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? t('dangerZone.deleteAccount.deleting') : t('dangerZone.deleteAccount.button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{commonT('account')}</h3>
          <p className="text-sm text-muted-foreground">
            {commonT('description')}
          </p>
        </div>
        <form>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('password.title')}</CardTitle>
              <CardDescription>
                {t('password.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">{t('password.currentPassword')}</Label>
                <Input disabled id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">{t('password.newPassword')}</Label>
                <Input disabled id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t('password.confirmPassword')}</Label>
                <Input disabled id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>{t('password.changePassword')}</Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t('dangerZone.title')}</CardTitle>
            <CardDescription>
              {t('dangerZone.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('dangerZone.warning')}
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {t('dangerZone.deleteAccount.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
