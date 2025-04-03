import { useState } from 'react';

export type StepState<T> = {
  data: T;
  isValid: boolean;
};

export function useMultiStepForm<T extends Record<string, unknown>>(
  initialValues: T,
  totalSteps: number,
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<T>(initialValues);
  const [stepStates, setStepStates] = useState<StepState<Partial<T>>[]>(
    Array(totalSteps).fill({ data: {}, isValid: false }),
  );

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const updateFormData = (stepData: Partial<T>, isStepValid: boolean) => {
    // Update the form data
    setFormData((prev) => ({ ...prev, ...stepData }));

    // Update the step state
    setStepStates((prev) => {
      const newStepStates = [...prev];
      newStepStates[currentStep] = {
        data: stepData,
        isValid: isStepValid,
      };
      return newStepStates;
    });
  };

  const isStepValid = (step: number) => {
    return stepStates[step]?.isValid || false;
  };

  const canGoToNextStep = () => {
    return isStepValid(currentStep);
  };

  return {
    currentStep,
    formData,
    stepStates,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateFormData,
    isStepValid,
    canGoToNextStep,
  };
}
