import { toast } from 'sonner';
import { Button } from '@/components/ui/common/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/data-display/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/forms/form';
import { Input } from '@/components/ui/forms/input';
import { updateProfileInfo } from '@/lib/api/profile';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileFormValues } from '../hooks/useProfileForm';
import { useState } from 'react';
import { logout } from '@/lib/actions/auth/logout';

interface PersonalInformationProps {
  form: UseFormReturn<ProfileFormValues>;
  isLoading: boolean;
}

export function PersonalInformation({
  form,
  isLoading,
}: PersonalInformationProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<ProfileFormValues | null>(
    null,
  );

  const handleSubmit = (data: ProfileFormValues) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const onConfirm = async () => {
    if (!pendingData) return;

    try {
      await updateProfileInfo(pendingData);
      toast('Your profile has been updated successfully.');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast('Failed to update profile. Please try again later.');
      setShowConfirmDialog(false);
    }

    await logout();
  };

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Profile Update</DialogTitle>
            <DialogDescription>
              Updating your profile information will require you to log in again
              for security purposes. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={onConfirm}>
              Update and Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-muted animate-pulse rounded-md"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco, CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
