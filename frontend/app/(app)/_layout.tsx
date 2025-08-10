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
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
        </Stack>
    )
}
export default AppLayout;
