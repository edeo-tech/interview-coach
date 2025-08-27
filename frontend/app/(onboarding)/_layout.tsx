import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import Colors from '../../constants/Colors';

const OnboardingLayout = () => {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          gestureEnabled: false,
          contentStyle: styles.stackContent,
        }}
      >
        <Stack.Screen name="profile-setup" /> {/* Unified Profile Setup - Screens 3-5 */}
        <Stack.Screen name="section-transition" /> {/* Section Transition - Screen 5.5 */}
        <Stack.Screen name="cv-upload" /> {/* Old Profile Card Intro - Screen 3 (deprecated) */}
        <Stack.Screen name="name-input" /> {/* Old Name Input - Screen 4 (deprecated) */}
        <Stack.Screen name="age-input" /> {/* Old Age Input - Screen 5 (deprecated) */}
        <Stack.Screen name="job-role" /> {/* Industry Selection - Screen 6 */}
        <Stack.Screen name="industry-struggle" /> {/* Industry Struggle - Screen 7 */}
        <Stack.Screen name="past-outcomes" /> {/* Past Interview Outcomes - Screen 8 */}
        <Stack.Screen name="preparation-rating" /> {/* Preparation Rating - Screen 9 */}
        <Stack.Screen name="communication-rating" /> {/* Communication Rating - Screen 10 */}
        <Stack.Screen name="nerves-rating" /> {/* Nerves Rating - Screen 11 */}
        <Stack.Screen name="problems" /> {/* Analyzing - Screen 12 */}
        <Stack.Screen name="solutions" /> {/* Problem Validation - Screen 13 */}
        <Stack.Screen name="demo" /> {/* Solution Framing - Screen 14 */}
        <Stack.Screen name="notifications" /> {/* Reassurance/Data Proof - Screen 15 */}
        <Stack.Screen name="reviews" /> {/* Social Proof - Screen 16 */}
      </Stack>
    </OnboardingProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  stackContent: {
    backgroundColor: Colors.transparent,
  },
});

export default OnboardingLayout;