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
            <Stack.Screen name="interviews" />
            <Stack.Screen 
                name="mock-interview"
            />
        </Stack>
    )
}
export default AppLayout;
