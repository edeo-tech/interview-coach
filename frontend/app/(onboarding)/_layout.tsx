import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const OnboardingLayout = () => {
  return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: styles.stackContent,
        }}
      >
        <Stack.Screen name="cv-upload" />
        <Stack.Screen name="job-role" />
        <Stack.Screen name="problems" />
        <Stack.Screen name="solutions" />
        <Stack.Screen name="demo" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="reviews" />
      </Stack>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  stackContent: {
    backgroundColor: 'transparent',
  },
});

export default OnboardingLayout;