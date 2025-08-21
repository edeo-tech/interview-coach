import { createContext, useContext, useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

type SplashScreenContextType = {
  fontsLoaded: boolean;
  setFontsLoaded: (loaded: boolean) => void;
  hideSplashScreen: () => Promise<void>;
  readyToHideSplashScreen: boolean;
  setReadyToHideSplashScreen: (ready: boolean) => void;
};

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(undefined);

export const SplashScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [readyToHideSplashScreen, setReadyToHideSplashScreen] = useState(false);

  const hideSplashScreen = async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  };

  // Automatically hide splash screen when both fonts are loaded and we're ready
  useEffect(() => {
    if (fontsLoaded && readyToHideSplashScreen) {
      hideSplashScreen();
    }
  }, [fontsLoaded, readyToHideSplashScreen]);

  useEffect(() => {
    // Signal that we're ready to hide the splash screen
    setTimeout(() => {
        setReadyToHideSplashScreen(true);
    }, 1000);
}, []);

  return (
    <SplashScreenContext.Provider
      value={{
        fontsLoaded,
        setFontsLoaded,
        hideSplashScreen,
        readyToHideSplashScreen,
        setReadyToHideSplashScreen,
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
