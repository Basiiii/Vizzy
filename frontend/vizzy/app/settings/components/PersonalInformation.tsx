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
import { updateProfileInfo } from '@/lib/api/profile/profile';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileFormValues } from '../hooks/useProfileForm';
import { useState } from 'react';
import { logout } from '@/lib/api/auth/actions/logout';
import { useTranslations } from 'next-intl';

interface PersonalInformationProps {
  form: UseFormReturn<ProfileFormValues>;
  isLoading: boolean;
}

export function PersonalInformation({
  form,
  isLoading,
}: PersonalInformationProps) {
  const t = useTranslations('settings.personalInfo');
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
      toast(t('success'));
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast(t('error'));
      setShowConfirmDialog(false);
    }

    await logout();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('username')}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>{t('usernameDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>{t('nameDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormDescription>{t('emailDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('location')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>{t('locationDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end"> {/* Add justify-end class */}
              <Button type="submit" disabled={isLoading}>
                {t('saveChanges')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.title')}</DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {t('dialog.cancel')}
            </Button>
            <Button onClick={onConfirm}>{t('dialog.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
