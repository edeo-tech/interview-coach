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
  setTransitionRendered: (rendered: boolean) => void;
};

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(undefined);

export const SplashScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [readyToHideSplashScreen, setReadyToHideSplashScreen] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [authRoutingReady, setAuthRoutingReady] = useState(false);
  const [transitionRendered, setTransitionRendered] = useState(false);

  const hideSplashScreen = async () => {
    try {
      console.log('🟡 SPLASH: About to hide native splash screen');
      await SplashScreen.hideAsync();
      console.log('🟢 SPLASH: Native splash screen hidden');
    } catch (error) {
      console.error('🔴 SPLASH: Error hiding splash screen:', error);
    }
  };

  // Check when both fonts and auth routing are ready
  useEffect(() => {
    console.log('🟡 SPLASH: Checking readiness - fonts:', fontsLoaded, 'auth:', authRoutingReady);
    if (fontsLoaded && authRoutingReady) {
      console.log('🟢 SPLASH: Both fonts and auth ready - setting ready to hide splash');
      setReadyToHideSplashScreen(true);
    }
  }, [fontsLoaded, authRoutingReady]);

  // First stage: Show transition component
  useEffect(() => {
    if (readyToHideSplashScreen && !showTransition) {
      console.log('🟡 SPLASH: Ready to hide splash - showing transition first');
      setShowTransition(true);
    }
  }, [readyToHideSplashScreen, showTransition]);

  // Second stage: Hide splash after transition is rendered
  useEffect(() => {
    if (showTransition && transitionRendered) {
      console.log('🟡 SPLASH: Transition rendered, now hiding splash screen');
      setTimeout(() => {
        hideSplashScreen();
      }, 100); // Small delay to ensure transition is fully rendered
    }
  }, [showTransition, transitionRendered]);

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
        setTransitionRendered,
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
