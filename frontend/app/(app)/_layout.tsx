import { Stack } from 'expo-router';

const AppLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
                name="mock-interview"
            />
            <Stack.Screen 
                name="interviews/[id]/attempts/[attemptId]/grading"
                options={{ 
                    gestureEnabled: false,
                    animation: 'fade'
                }}
            />
            <Stack.Screen 
                name="interviews/[id]/attempts/[attemptId]/transcript"
                options={{ 
                    animation: 'slide_from_right'
                }}
            />
            <Stack.Screen name="terms" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
        </Stack>
    )
}
export default AppLayout;
