import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getClientUser } from '@/lib/utils/token/get-client-user';
import { fetchUserProfile } from '@/lib/api/profile/profile';
import type { UseFormReturn } from 'react-hook-form';
import type { ProfileFormValues } from './useProfileForm';

export function useProfileData(form: UseFormReturn<ProfileFormValues>) {
  const [isLoading, setIsLoading] = useState({
    profile: true,
    avatar: true,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfileInfo() {
      try {
        const userData = getClientUser();
        if (!userData?.username) return;

        const profile = await fetchUserProfile(userData.username);

        form.reset({
          username: userData.username,
          name: profile.name,
          email: userData.email,
          location: profile.location || '',
        });

        setAvatarUrl(profile.avatarUrl);
        setIsLoading((prev) => ({ ...prev, avatar: false }));
      } catch (error) {
        console.error('Failed to load profile info:', error);
        toast('Failed to load profile information. Please try again later.');
      } finally {
        setIsLoading((prev) => ({ ...prev, profile: false }));
      }
    }

    loadProfileInfo();
  }, [form]);

  return { isLoading, avatarUrl, setAvatarUrl };
}
