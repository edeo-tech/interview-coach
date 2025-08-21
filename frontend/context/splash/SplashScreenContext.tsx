import { createContext, useContext, useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

type SplashScreenContextType = {
  fontsLoaded: boolean;
  setFontsLoaded: (loaded: boolean) => void;
  hideSplashScreen: () => Promise<void>;
  readyToHideSplashScreen: boolean;
  setReadyToHideSplashScreen: (ready: boolean) => void;
  showTransition: boolean;
  setShowTransition: (show: boolean) => void;
  authRoutingReady: boolean;
  setAuthRoutingReady: (ready: boolean) => void;
};

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(undefined);

export const SplashScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [readyToHideSplashScreen, setReadyToHideSplashScreen] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [authRoutingReady, setAuthRoutingReady] = useState(false);

  const hideSplashScreen = async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  };

  // Check when both fonts and auth routing are ready
  useEffect(() => {
    if (fontsLoaded && authRoutingReady) {
      setReadyToHideSplashScreen(true);
    }
  }, [fontsLoaded, authRoutingReady]);

  // Automatically hide splash screen and show transition when ready
  useEffect(() => {
    if (readyToHideSplashScreen) {
      hideSplashScreen();
      setShowTransition(true);
    }
  }, [readyToHideSplashScreen]);

  return (
    <SplashScreenContext.Provider
      value={{
        fontsLoaded,
        setFontsLoaded,
        hideSplashScreen,
        readyToHideSplashScreen,
        setReadyToHideSplashScreen,
        showTransition,
        setShowTransition,
        authRoutingReady,
        setAuthRoutingReady,
      }}
    >
      {children}
    </SplashScreenContext.Provider>
  );
};

export const useSplashScreen = () => {
  const context = useContext(SplashScreenContext);
  if (!context) {
    throw new Error('useSplashScreen must be used within a SplashScreenProvider');
  }
  return context;
}; 
