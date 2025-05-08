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
} from '@/app/auth/signup/schema/multi-step-signup-schema';
import { Loader2 } from 'lucide-react';
import { fetchLocationDetails } from '@/lib/api/location/geocoding';
import { toast } from 'sonner';

interface LocationFormProps {
  defaultValues?: Partial<LocationValues>;
  onSubmit: (
    data: LocationValues & {
      fullAddress: string;
      latitude: number;
      longitude: number;
    },
  ) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export function LocationForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitButtonText = 'Submit Location',
  cancelButtonText = 'Cancel',
}: LocationFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [locationData, setLocationData] = React.useState<
    | (LocationValues & {
        fullAddress: string;
        latitude: number;
        longitude: number;
      })
    | null
  >(null);

  const form = useForm<LocationValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      country: defaultValues?.country || '',
      village: defaultValues?.village || '',
    },
  });

  const handleSubmit = async (data: LocationValues) => {
    setIsLoading(true);

    try {
      const result = await fetchLocationDetails(data.country, data.village);

      if (!result.data?.valid) {
        toast.warning(
          "We couldn't find this location. Please check your input and try again.",
        );
        form.setError('country', {
          type: 'manual',
          message: 'Please check your input',
        });
        return;
      }

      if (
        !result.data.fullAddress ||
        !result.data.latitude ||
        !result.data.longitude
      ) {
        toast.warning(
          "We found the location but couldn't get all the details. Please try entering a more specific location.",
        );
        form.setError('country', {
          type: 'manual',
          message: 'Please try a more specific location',
        });
        return;
      }

      setLocationData({
        country: result.data.country,
        village: result.data.village,
        fullAddress: result.data.fullAddress,
        latitude: result.data.latitude,
        longitude: result.data.longitude,
      });
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error validating location:', error);
      toast.error(
        'There was an error validating your location. Please try again.',
      );
      form.setError('country', {
        type: 'manual',
        message: 'Please check your input',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (locationData) {
      onSubmit(locationData);
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
            <div>
              <span className="font-medium">Full Address:</span>{' '}
              {locationData.fullAddress}
            </div>
            <div className="text-xs text-muted-foreground">
              Coordinates: {locationData.latitude.toFixed(6)},{' '}
              {locationData.longitude.toFixed(6)}
            </div>
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
      form.handleSubmit(handleSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
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
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
