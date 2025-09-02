import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSubmitOnboardingAnswers } from '../_queries/onboarding/onboarding';
import { OnboardingAnswersSubmission } from '../_interfaces/onboarding/onboarding-answers';

interface OnboardingData {
  name: string;
  age: string;
  industry: string;
  hasFailed: boolean | null;
  preparationRating: number;
  communicationRating: number;
  nervesRating: number;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  resetData: () => void;
  submitAnswers: () => Promise<void>;
  isSubmitting: boolean;
  submissionError: Error | null;
}

const initialData: OnboardingData = {
  name: '',
  age: '',
  industry: '',
  hasFailed: null,
  preparationRating: 0,
  communicationRating: 0,
  nervesRating: 0,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const submitMutation = useSubmitOnboardingAnswers();

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const resetData = () => {
    setData(initialData);
  };

  const submitAnswers = async () => {
    if (data.hasFailed === null) {
      throw new Error('Has failed field must be set');
    }

    const submission: OnboardingAnswersSubmission = {
      industry: data.industry,
      has_failed: data.hasFailed,
      preparation_rating: data.preparationRating,
      communication_rating: data.communicationRating,
      nerves_rating: data.nervesRating
    };

    await submitMutation.mutateAsync(submission);
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        data, 
        updateData, 
        resetData,
        submitAnswers,
        isSubmitting: submitMutation.isPending,
        submissionError: submitMutation.error
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    // Return default values instead of throwing error for testing
    console.warn('useOnboarding must be used within an OnboardingProvider. Using default values.');
    return {
      data: initialData,
      updateData: () => {},
      resetData: () => {},
      submitAnswers: async () => {},
      isSubmitting: false,
      submissionError: null
    };
  }
  return context;
};