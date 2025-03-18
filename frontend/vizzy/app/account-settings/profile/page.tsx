'use client';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
//import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileLayout } from '@/app/account-settings/components/layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';

const supabase = await createClient();
const user = await supabase.auth.getSession();

export default function ProfileSettingsPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    // Create a preview URL for the selected image
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Clean up the object URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  return (
    <ProfileLayout currentPath="/settings/profile">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">
          {t('accountPageCommon.profile')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('profilePage.description')}
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              placeholder="Your Name"
              defaultValue={user.data.session?.user.user_metadata.name}
            />
            <p className="text-sm text-muted-foreground">
              {t('profilePage.nameDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t('form.username')}</Label>
            <Input
              id="username"
              placeholder="Your Username"
              defaultValue={user.data.session?.user.user_metadata.username}
            />
            <p className="text-sm text-muted-foreground">
              {t('profilePage.usernameDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('form.location')}</Label>
            <Input
              id="location"
              placeholder={t('form.locationPlaceholder')}
              defaultValue={user.data.session?.user.user_metadata.location}
            />
            <p className="text-sm text-muted-foreground">
              {t('profilePage.locationDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">{t('form.profilePic')}</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="w-full max-w-xs"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {t('profilePage.profilePicDescription')}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="border rounded-md p-1 bg-muted/20">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={previewUrl || ''} alt="Profile preview" />
                    <AvatarFallback className="bg-muted">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('profilePage.preview')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          {t('profilePage.updateButton')}
        </Button>
      </form>
    </ProfileLayout>
  );
}
