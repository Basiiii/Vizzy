'use client';

import { useProfileForm } from './hooks/useProfileForm';
import { useProfileData } from './hooks/useProfileData';
import { ProfilePicture } from './components/profile-picture';
import { PersonalInformation } from './components/personal-information';
import { ContactsSection } from './components/contacts-section';
import { LocationSettings } from './components/location-settings';
import { useTranslations } from 'next-intl';

export default function ProfileSettings() {
  const form = useProfileForm();
  const { isLoading, avatarUrl, setAvatarUrl } = useProfileData(form);
  const t = useTranslations('accountSettings.profileTab');
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <ProfilePicture
        avatarUrl={avatarUrl}
        isLoading={isLoading.avatar}
        nameInitial={form.getValues('name')?.charAt(0).toUpperCase() || 'U'}
        onAvatarUpdate={setAvatarUrl}
      />

      <PersonalInformation form={form} isLoading={isLoading.profile} />

      <LocationSettings />

      <ContactsSection />
    </div>
  );
}
