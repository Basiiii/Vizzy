import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchUserProfile } from '@/lib/api/profile/profile';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileFormValues } from './useProfileForm';
import { getUserMetadataAction } from '@/lib/actions/auth/get-user-metadata-action';

export function useProfileData(form: UseFormReturn<ProfileFormValues>) {
  const [isLoading, setIsLoading] = useState({
    profile: true,
    avatar: true,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfileInfo() {
      const userData = await getUserMetadataAction();
      if (!userData?.username) return;

      const result = await fetchUserProfile(userData.username);

      if (result.error || !result.data) {
        console.error('Failed to load profile info:', result.error);
        toast('Failed to load profile information. Please try again later.');
        setIsLoading((prev) => ({ ...prev, profile: false, avatar: false }));
        return;
      }

      form.reset({
        username: userData.username,
        name: result.data.name,
        email: userData.email,
        location: result.data.location || '',
      });

      setAvatarUrl(result.data.avatarUrl);
      setIsLoading((prev) => ({ ...prev, avatar: false, profile: false }));
    }

    loadProfileInfo();
  }, [form]);

  return { isLoading, avatarUrl, setAvatarUrl };
}
