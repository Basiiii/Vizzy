'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/shadcn-merge';
import { ROUTES } from '@/lib/constants/routes/routes';
import { useMultiStepForm } from '@/lib/utils/forms/multi-step-form';
import {
  processSignup,
  getStepForErrorCode,
} from '@/lib/services/auth/signup-service';
import {
  MultiStepSignupValues,
  BasicInfoValues,
  AccountSetupValues,
  LocationValues,
} from '../schema/multi-step-signup-schema';
import { BasicInfoStep } from './steps/basic-info-step';
import { AccountSetupStep } from './steps/account-setup-step';
import { LocationStep } from './steps/location-step';

type MultiStepSignupFormProps = React.HTMLAttributes<HTMLDivElement>;

export function MultiStepSignupForm({
  className,
  ...props
}: MultiStepSignupFormProps) {
  // const t = useTranslations('signUp');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  // Add state for field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const initialValues: MultiStepSignupValues = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    country: '',
    village: '',
  };

  const {
    currentStep,
    formData,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  } = useMultiStepForm<MultiStepSignupValues>(initialValues, 3);

  // Add function to set field errors
  const setFieldError = (field?: string, message?: string) => {
    if (field && message) {
      setFieldErrors((prev) => ({ ...prev, [field]: message }));
    }
  };

  // Add function to clear field errors
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleBasicInfoNext = (data: BasicInfoValues) => {
    updateFormData(data, true);
    goToNextStep();
  };

  const handleAccountSetupNext = (data: AccountSetupValues) => {
    updateFormData(data, true);
    goToNextStep();
  };

  const handleLocationNext = async (data: LocationValues) => {
    updateFormData(data, true);

    // All steps are complete, submit the form
    setIsSubmitting(true);

    try {
      // Process the complete signup
      await processSignup({
        ...formData,
        ...data,
      });

      // Redirect to home on success
      router.push(ROUTES.HOME);
    } catch (error: unknown) {
      let errorCode = 'GENERIC_ERROR';
      let errorMessage = 'An error occurred during sign-up.';
      let errorField: string | undefined;

      // Parse structured error
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          errorCode = parsedError.code || errorCode;
          errorMessage = parsedError.message || errorMessage;
          errorField = parsedError.field;
        } catch {
          // Fallback to message if not structured error
          errorMessage = error.message;
        }
      }

      // Show error message
      toast.error(errorMessage);

      // Navigate to the appropriate step based on the error
      const stepToNavigate = getStepForErrorCode(errorCode);
      goToStep(stepToNavigate);

      // Set field error in the form
      if (errorField) {
        setFieldError(errorField, errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          {[0, 1, 2].map((step) => (
            <React.Fragment key={step}>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep === step
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {step + 1}
              </div>
              {step < 2 && (
                <div
                  className={cn(
                    'w-10 h-1',
                    currentStep > step ? 'bg-primary/60' : 'bg-muted',
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Step titles
  const stepTitles = ['Basic Information', 'Account Setup', 'Location'];

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {renderStepIndicator()}

      <div className="text-center mb-2">
        <h2 className="text-lg font-medium">{stepTitles[currentStep]}</h2>
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of 3
        </p>
      </div>

      {isSubmitting ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            Creating your account...
          </p>
        </div>
      ) : (
        <>
          {currentStep === 0 && (
            <BasicInfoStep
              defaultValues={formData}
              onNext={handleBasicInfoNext}
              fieldErrors={fieldErrors}
              clearFieldError={clearFieldError}
            />
          )}

          {currentStep === 1 && (
            <AccountSetupStep
              defaultValues={formData}
              onNext={handleAccountSetupNext}
              onBack={goToPreviousStep}
              fieldErrors={fieldErrors}
              clearFieldError={clearFieldError}
            />
          )}

          {currentStep === 2 && (
            <LocationStep
              defaultValues={formData}
              onNext={handleLocationNext}
              onBack={goToPreviousStep}
            />
          )}
        </>
      )}
    </div>
  );
}
