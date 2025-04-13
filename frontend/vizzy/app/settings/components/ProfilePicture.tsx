import { useState } from 'react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/data-display/avatar';
import { Button } from '@/components/ui/common/button';
import { Label } from '@/components/ui/common/label';
import { Upload } from 'lucide-react';
import { updateAvatar } from '@/lib/api/profile/profile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { useTranslations } from 'next-intl';

interface ProfilePictureProps {
  avatarUrl: string | null;
  isLoading: boolean;
  nameInitial: string;
  onAvatarUpdate: (url: string) => void;
}

export function ProfilePicture({
  avatarUrl,
  isLoading,
  nameInitial,
  onAvatarUpdate,
}: ProfilePictureProps) {
  const t = useTranslations('settings.profile');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      onAvatarUpdate(objectUrl);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!selectedImage) return;

    setIsUploadingAvatar(true);
    try {
      await updateAvatar(selectedImage);
      toast('Your profile picture has been updated successfully.');
    } catch (error) {
      console.error('Upload error:', error);
      toast('Failed to update profile picture. Please try again later.');
    } finally {
      setIsUploadingAvatar(false);
      setSelectedImage(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('picture.title')}</CardTitle>
        <CardDescription>{t('picture.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 cursor-pointer">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  <span className="animate-pulse">{t('loading')}</span>
                </div>
              ) : (
                <>
                  <AvatarImage
                    src={avatarUrl || '/placeholder.svg'}
                    alt={t('picture.alt')}
                  />
                  <AvatarFallback>{nameInitial || 'U'}</AvatarFallback>
                </>
              )}
              <Label
                htmlFor="picture"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Upload className="h-6 w-6 text-white" />
              </Label>
            </Avatar>
            <input
              id="picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="space-y-2 flex-1">
            <div className="text-sm text-muted-foreground">
              {t('picture.recommended')}
            </div>
            <Button
              onClick={handleAvatarUpdate}
              disabled={!selectedImage || isUploadingAvatar}
              className="cursor-pointer"
            >
              {isUploadingAvatar ? t('picture.saving') : t('picture.save')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
