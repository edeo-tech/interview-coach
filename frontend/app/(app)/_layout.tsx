import { Stack } from 'expo-router';

const AppLayout = () =>
{
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="temp-home" />
        </Stack>
    )
}
export default AppLayout;
