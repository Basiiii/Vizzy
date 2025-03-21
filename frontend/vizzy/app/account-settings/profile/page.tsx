'use client';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
//import { Metadata } from 'next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileLayout } from '@/app/account-settings/components/layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { UserData } from '@/types/user';
import { getMeFE } from '../utils/get-me';
import { User } from 'lucide-react';
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileDataSchema } from '@/app/account-settings/profile/schema/profilePageSchema';
import { UpdateProfileButton } from './Components/update-profile-button';

const user: UserData = await getMeFE();

export default function ProfileSettingsPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [country, setCountry] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations();

  const form = useForm({
    resolver: zodResolver(profileDataSchema),
    defaultValues: {
      country: null,
      state: null,
      city: null,
    },
  });
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
    <ProfileLayout>
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
            <Input id="name" placeholder="Your Name" defaultValue={user.name} />
            <p className="text-sm text-muted-foreground">
              {t('profilePage.nameDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t('form.username')}</Label>
            <Input
              id="username"
              placeholder="Your Username"
              defaultValue={user.username}
            />
            <p className="text-sm text-muted-foreground">
              {t('profilePage.usernameDescription')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('form.location')}</Label>

            <div>
              {/* Country Selection */}
              <h6>Country</h6>
              <CountrySelect
                onChange={(_country) => {
                  setCountry(_country);
                  setCurrentState(null); // Reseta o estado ao mudar o país
                  setCurrentCity(null); // Reseta a cidade ao mudar o país
                }}
                placeHolder="Select Country"
                defaultValue={country}
                containerClassName="flex
                flex-col
                space-y-10 max-w-300"
                inputClassName="flex
                flex-col
                space-y-10 max-w-300"
              />

              {/* State Selection */}
              {country && (
                <>
                  <h6>State</h6>
                  <StateSelect
                    countryid={country?.id}
                    onChange={(_state) => {
                      setCurrentState(_state);
                      setCurrentCity(null); // Reseta a cidade ao mudar o estado
                    }}
                    placeHolder="Select State"
                    defaultValue={currentState}
                    containerClassName="flex
                flex-col
                space-y-10 max-w-300"
                    inputClassName="flex
                flex-col
                space-y-10 max-w-300"
                  />
                </>
              )}

              {/* City Selection */}
              {currentState && (
                <>
                  <h6>City</h6>
                  <CitySelect
                    countryid={country?.id}
                    stateid={currentState?.id}
                    onChange={(_city) => setCurrentCity(_city)}
                    defaultValue={currentCity}
                    placeHolder="Select City"
                    containerClassName="flex
                flex-col
                space-y-10 max-w-300"
                    inputClassName="flex
                flex-col
                space-y-10 max-w-300"
                  />
                </>
              )}
            </div>
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
      </form>
      <UpdateProfileButton />
    </ProfileLayout>
  );
}
