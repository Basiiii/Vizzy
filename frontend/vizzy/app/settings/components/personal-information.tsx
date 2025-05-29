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
import { logoutUserAction } from '@/lib/actions/auth/logout-action';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes/routes';
import { useTranslations } from 'next-intl';

interface PersonalInformationProps {
  form: UseFormReturn<ProfileFormValues>;
  isLoading: boolean;
}

export function PersonalInformation({
  form,
  isLoading,
}: PersonalInformationProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<ProfileFormValues | null>(
    null,
  );
  const t = useTranslations('accountSettings.profileTab');
  const handleLogout = async () => {
    await logoutUserAction();
    router.push(ROUTES.LOGIN);
  };

  const handleSubmit = (data: ProfileFormValues) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const onConfirm = async () => {
    if (!pendingData) return;

    const result = await updateProfileInfo(pendingData);
    if (result.error) {
      console.error('Failed to update profile:', result.error);
      toast(t('updateProfileError'));
      setShowConfirmDialog(false);
      return;
    }

    toast(t('updateProfileSuccess'));
    setShowConfirmDialog(false);

    await handleLogout();
  };

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmProfileUpdate')}</DialogTitle>
            <DialogDescription>
              {t('confirmProfileUpdateDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              {t('cancel')}
            </Button>
            <Button className="cursor-pointer" onClick={onConfirm}>
              {t('updateAndSignOut')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{t('personalInformation')}</CardTitle>
              <CardDescription>
                {t('personalInformationDescription')}
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
                        <FormLabel>{t('username')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('usernamePlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('usernameDescription')}
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
                        <FormLabel>{t('name')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('namePlaceholder')}
                            {...field}
                          />
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
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
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
                  /> */}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {t('update')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
