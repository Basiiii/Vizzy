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

export default function AccountSettings() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone. All of your data will be permanently removed from our
              servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Account</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        {/* TODO: Implement password update */}
        <form>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password here. After saving, you&apos;ll be logged
                out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input disabled id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input disabled id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input disabled id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>Change password</Button>
            </CardFooter>
          </Card>
        </form>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all of your content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. This action
              cannot be undone. All of your data will be permanently removed
              from our servers.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
