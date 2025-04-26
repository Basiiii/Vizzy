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
  const t = useTranslations();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      toast(t('settings.account.dangerZone.deleteAccount.toast.success'));
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast(t('settings.account.dangerZone.deleteAccount.toast.error'));
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('settings.account.dangerZone.deleteAccount.confirmDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('settings.account.dangerZone.deleteAccount.confirmDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {t('settings.account.dangerZone.deleteAccount.confirmDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? t('settings.account.dangerZone.deleteAccount.deleting') : t('settings.account.dangerZone.deleteAccount.button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t('settings.account.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('settings.account.description')}
          </p>
        </div>
        <form>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('settings.account.password.title')}</CardTitle>
              <CardDescription>
                {t('settings.account.password.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">{t('settings.account.password.currentPassword')}</Label>
                <Input disabled id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">{t('settings.account.password.newPassword')}</Label>
                <Input disabled id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t('settings.account.password.confirmPassword')}</Label>
                <Input disabled id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>{t('settings.account.password.changePassword')}</Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t('settings.account.dangerZone.title')}</CardTitle>
            <CardDescription>
              {t('settings.account.dangerZone.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.account.dangerZone.warning')}
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {t('settings.account.dangerZone.deleteAccount.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
