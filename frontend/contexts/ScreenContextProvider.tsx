import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ScreenContextData {
  screenName: string;
  title: string;
  description: string;
  keyData?: Record<string, any>;
  availableActions?: string[];
}

interface ScreenContextType {
  currentScreen: ScreenContextData | null;
  registerScreen: (data: ScreenContextData) => void;
  unregisterScreen: () => void;
}

const ScreenContext = createContext<ScreenContextType | undefined>(undefined);

interface ScreenContextProviderProps {
  children: ReactNode;
}

export const ScreenContextProvider = ({ children }: ScreenContextProviderProps) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenContextData | null>(null);

  const registerScreen = useCallback((data: ScreenContextData) => {
    setCurrentScreen(data);
  }, []);

  const unregisterScreen = useCallback(() => {
    setCurrentScreen(null);
  }, []);

  return (
    <ScreenContext.Provider value={{ currentScreen, registerScreen, unregisterScreen }}>
      {children}
    </ScreenContext.Provider>
  );
};

export const useScreenContext = () => {
  const context = useContext(ScreenContext);
  if (context === undefined) {
    throw new Error('useScreenContext must be used within a ScreenContextProvider');
  }
  return context;
};
