'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/common/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/forms/form';
import { Input } from '@/components/ui/forms/input';
import {
  LocationValues,
  locationSchema,
} from '../../schema/multi-step-signup-schema';
// import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { fetchLocationDetails } from '@/lib/services/location/location-service';

interface LocationStepProps {
  defaultValues: Partial<LocationValues>;
  onNext: (data: LocationValues) => void;
  onBack: () => void;
}

export function LocationStep({
  defaultValues,
  onNext,
  onBack,
}: LocationStepProps) {
  // const t = useTranslations('signUp');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [locationData, setLocationData] = React.useState<
    | (LocationValues & {
        fullAddress?: string;
        latitude?: number;
        longitude?: number;
      })
    | null
  >(null);

  const form = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      country: defaultValues.country || '',
      village: defaultValues.village || '',
    },
  });

  const onSubmit = async (data: LocationValues) => {
    setIsLoading(true);

    try {
      // Validate location data with the service
      const result = await fetchLocationDetails(data.country, data.village);

      if (result.valid) {
        setLocationData({
          country: result.country,
          village: result.village,
          fullAddress: result.fullAddress,
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setShowConfirmation(true);
      } else {
        form.setError('country', {
          type: 'manual',
          message: 'Invalid location data',
        });
      }
    } catch (error) {
      console.error('Error validating location:', error);
      form.setError('country', {
        type: 'manual',
        message: 'Error validating location',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (locationData) {
      onNext(locationData);
    }
  };

  const handleEdit = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation && locationData) {
    return (
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Confirm Your Location</h3>
          <div className="space-y-2">
            {locationData.fullAddress ? (
              <div>
                <span className="font-medium">Full Address:</span>{' '}
                {locationData.fullAddress}
              </div>
            ) : (
              <>
                <div>
                  <span className="font-medium">Country:</span>{' '}
                  {locationData.country}
                </div>
                <div>
                  <span className="font-medium">Village:</span>{' '}
                  {locationData.village}
                </div>
              </>
            )}
            {locationData.latitude && locationData.longitude && (
              <div className="text-xs text-muted-foreground">
                Coordinates: {locationData.latitude.toFixed(6)},{' '}
                {locationData.longitude.toFixed(6)}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button type="button" className="flex-1" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-4"
        onKeyDown={handleKeyDown}
      >
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Enter your country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="village"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village</FormLabel>
              <FormControl>
                <Input placeholder="Enter your village" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Submit Location'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
