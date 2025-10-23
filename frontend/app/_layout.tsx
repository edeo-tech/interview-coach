// Import our centralized font loading system
import { useAppFonts } from '@/hooks/useFonts';

import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Updates from 'expo-updates';
import { ErrorBoundary as ExpoErrorBoundary } from 'expo-router';

import Middleware from './Middleware';
import { setBackgroundColorAsync } from 'expo-navigation-bar';
import { SplashScreenProvider, useSplashScreen } from '@/context/splash/SplashScreenContext';
import Main from './Main';
import { ToastProvider } from '@/components/Toast';

export function ErrorBoundary(props: any) {
  const isDevelopment = process.env.EXPO_PUBLIC_MODE === 'development';
  
  if (isDevelopment) {
    return <ExpoErrorBoundary {...props} />;
  }
  
  // In production, don't catch errors - let the app crash
  return props.children;
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.setOptions({
    fade: true,
    duration: 500
});
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayoutWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <SplashScreenProvider>
                <RootLayout />
            </SplashScreenProvider>
        </QueryClientProvider>
    );
}

function RootLayout() {
    const { setFontsLoaded } = useSplashScreen();
    const { fontsLoaded, fontError: error } = useAppFonts();

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        setFontsLoaded(fontsLoaded);
    }, [fontsLoaded, setFontsLoaded]);

    useEffect(() => {
        if(Platform.OS === 'android') {
            setBackgroundColorAsync('#FFFFFF');
        }
    }, []);

    const onUpdateCheck = async () => {
        if (process.env.EXPO_PUBLIC_MODE === 'development') return;
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
            }
        } catch (error) {
            console.error('Error fetching update: ', error);
        }
    };

    useEffect(() => {
        onUpdateCheck();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <ToastProvider>
            <Middleware>
                <Main />
            </Middleware>
        </ToastProvider>
    );
}
