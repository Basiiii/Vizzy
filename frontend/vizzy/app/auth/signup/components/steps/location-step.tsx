'use client';

import * as React from 'react';
import { LocationForm } from '@/app/components/forms/location-form';
import { LocationValues } from '../../schema/multi-step-signup-schema';

interface LocationStepProps {
  defaultValues: Partial<LocationValues>;
  onNext: (
    data: LocationValues & {
      fullAddress: string;
      latitude: number;
      longitude: number;
    },
  ) => void;
  onBack: () => void;
}

export function LocationStep({
  defaultValues,
  onNext,
  onBack,
}: LocationStepProps) {
  return (
    <LocationForm
      defaultValues={defaultValues}
      onSubmit={onNext}
      onCancel={onBack}
      submitButtonText="Next"
      cancelButtonText="Back"
    />
  );
}
