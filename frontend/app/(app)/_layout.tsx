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
            <Stack.Screen name="myportfolio" options={{ headerShown: false, title: 'My Portfolio' }} />
        </Stack>
    )
}
export default AppLayout;
