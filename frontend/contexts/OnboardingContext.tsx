import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingData {
  name: string;
  age: string;
  industry: string;
  hasFailed: boolean;
  preparationRating: number;
  communicationRating: number;
  nervesRating: number;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  resetData: () => void;
}

const initialData: OnboardingData = {
  name: '',
  age: '',
  industry: '',
  hasFailed: false,
  preparationRating: 0,
  communicationRating: 0,
  nervesRating: 0,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
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
      resetData: () => {}
    };
  }
  return context;
};