'use client';

import { useProfileForm } from './hooks/useProfileForm';
import { useProfileData } from './hooks/useProfileData';
import { ProfilePicture } from './components/ProfilePicture';
import { PersonalInformation } from './components/PersonalInformation';
import { ContactsSection } from './components/ContactsSection';

export default function ProfileSettings() {
  const form = useProfileForm();
  const { isLoading, avatarUrl, setAvatarUrl } = useProfileData(form);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>

      <ProfilePicture
        avatarUrl={avatarUrl}
        isLoading={isLoading.avatar}
        nameInitial={form.getValues('name')?.charAt(0).toUpperCase() || 'U'}
        onAvatarUpdate={setAvatarUrl}
      />

      <PersonalInformation form={form} isLoading={isLoading.profile} />

      <ContactsSection />
    </div>
  );
}
