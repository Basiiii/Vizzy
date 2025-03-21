'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updateProfile } from '../utils/update-profile';

export function UpdateProfileButton() {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);

      await updateProfile();
      toast.success('Your profile has been successfully updated.');

      setTimeout(() => {
        setIsUpdateDialogOpen(false);
      }, 300);
      // Redirect back to the profile page
      router.push('/account-settings/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile data. Please try again.');
    } finally {
      setIsUpdating(false);
      setIsUpdateDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        type="submit"
        className="w-full sm:w-auto mt-2"
        onClick={() => setIsUpdateDialogOpen(true)}
      >
        Update Profile
      </Button>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to update your profile data?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              No, Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleUpdateProfile}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Yes, Update Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
