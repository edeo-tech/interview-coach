import { Stack } from 'expo-router';
import { ScreenContextProvider } from '@/contexts/ScreenContextProvider';
import { FloatingIshaWidget } from '@/components/voice-agent/FloatingIshaWidget';

const AppLayout = () => {
    return (
        <ScreenContextProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                }}
            >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="myportfolio" options={{ headerShown: false, title: 'My Portfolio' }} />
                <Stack.Screen name="mutualfunds" options={{ headerShown: false, title: 'Mutual Funds' }} />
            </Stack>
            <FloatingIshaWidget />
        </ScreenContextProvider>
    )
}
export default AppLayout;
