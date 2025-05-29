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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { updateAvatar } from '@/lib/api/profile/avatar';
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const t = useTranslations('accountSettings.profileTab');
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 1024 * 1024) {
      toast(t('fileTooLarge'));
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast(t('fileNotSupported'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(file);
      onAvatarUpdate(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpdate = async () => {
    if (!selectedImage) return;

    setIsUploadingAvatar(true);
    try {
      const result = await updateAvatar(selectedImage);
      if (result.error) {
        console.error('Upload error:', result.error);
        toast.error(t('updateProfilePicError'));
      } else if (result.data) {
        toast.success(t('updateProfilePicSuccess'));
        onAvatarUpdate(result.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('updateProfilePicError'));
    } finally {
      setIsUploadingAvatar(false);
      setSelectedImage(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profilePic')}</CardTitle>
        <CardDescription>{t('profilePicDescription')}</CardDescription>
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
                    alt="Avatar"
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
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleImageChange}
              name="file"
            />
          </div>
          <div className="space-y-2 flex-1">
            <div className="text-sm text-muted-foreground">
              {t('recommended')}
            </div>
            <Button
              onClick={handleAvatarUpdate}
              disabled={!selectedImage || isUploadingAvatar}
              className="cursor-pointer"
            >
              {isUploadingAvatar ? t('saving') : t('updateProfilePicButton')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
