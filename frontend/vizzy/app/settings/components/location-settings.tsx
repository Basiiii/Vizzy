import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card';
import { LocationForm } from '@/app/components/forms/location-form';
import { toast } from 'sonner';
import { updateUserLocation } from '@/lib/api/user/location';
import { fetchUserLocation } from '@/lib/api/user/location';
import { LocationValues } from '@/app/auth/signup/schema/multi-step-signup-schema';
import { useTranslations } from 'next-intl';

export function LocationSettings() {
  const t = useTranslations('accountSettings.profileTab');
  const [defaultValues, setDefaultValues] = React.useState<
    Partial<LocationValues>
  >({});

  React.useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const result = await fetchUserLocation();
        if (result.data) {
          // Parse the full address to get country and village
          const addressParts = result.data.full_address.split(',');
          if (addressParts.length >= 2) {
            setDefaultValues({
              village: addressParts[0].trim(),
              country: addressParts[addressParts.length - 1].trim(),
            });
          }
        }
      } catch (error) {
        console.error('Failed to load user location:', error);
      }
    };

    loadUserLocation();
  }, []);

  const handleSubmit = async (data: {
    country: string;
    village: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const result = await updateUserLocation({
        address: data.fullAddress,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      if (!result.error) {
        toast(t('location.updateLocationSuccess'));
      } else {
        toast(t('location.updateLocationError'));
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast(t('location.updateLocationError'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('location.label')}</CardTitle>
      </CardHeader>
      <CardContent>
        <LocationForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitButtonText={t('location.updateLocationButton')}
        />
      </CardContent>
    </Card>
  );
}
