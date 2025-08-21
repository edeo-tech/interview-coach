import {
    useFonts,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
} from '@expo-google-fonts/inter';
import {
    SpaceGrotesk_600SemiBold,
} from '@expo-google-fonts/space-grotesk';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Updates from 'expo-updates';
import Purchases from 'react-native-purchases';
import { PostHogProvider } from 'posthog-react-native';
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

const revenueCatAppleApiKey = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY;
const revenueCatAndroidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export default function RootLayoutWrapper() {
    const AppTree = (
        <QueryClientProvider client={queryClient}>
            <SplashScreenProvider>
                <RootLayout />
            </SplashScreenProvider>
        </QueryClientProvider>
    );

    if (Platform.OS !== 'web') {
        return (
            <PostHogProvider
                apiKey='phc_HMWfNEsv3dRtaMjS562G6DlsrQnoTHP1TLEEhoV6unw'
                autocapture={false}
                options={{
                    host: "https://eu.i.posthog.com",
                    enableSessionReplay: true,
                    captureAppLifecycleEvents: true,
                    sessionReplayConfig: {
                        maskAllTextInputs: false,
                        maskAllImages: false,
                    },
                }}
            >
                {AppTree}
            </PostHogProvider>
        );
    }

    return AppTree;
}

function RootLayout() {
    const { setFontsLoaded } = useSplashScreen();
    const [fontsLoaded, error] = useFonts({
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Inter_900Black,
        SpaceGrotesk_600SemiBold,
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        setFontsLoaded(fontsLoaded);
    }, [fontsLoaded, setFontsLoaded]);

    useEffect(() => {
        const initializeRevenueCat = async () => {
            if (!revenueCatAppleApiKey || !revenueCatAndroidApiKey) {
                console.error("RevenueCat API keys are not defined");
                return;
            }

            if (Platform.OS === 'ios') {
                await Purchases.configure({ apiKey: revenueCatAppleApiKey });
            } else if (Platform.OS === 'android') {
                await Purchases.configure({ apiKey: revenueCatAndroidApiKey });
            }
        }

        if (Platform.OS !== 'web') {
            if (process.env.EXPO_PUBLIC_MODE === 'development') {
                Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
            }
            initializeRevenueCat();
        }
    }, []);

    useEffect(() => {
        if(Platform.OS === 'android') {
            setBackgroundColorAsync('#000000');
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
