import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          gestureEnabled: false, // Home screen doesn't need gesture
        }} 
      />
      <Stack.Screen 
        name="jobs/[id]" 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="interviews/[id]/details" 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}