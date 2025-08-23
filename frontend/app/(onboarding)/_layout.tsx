import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingProvider } from '../../contexts/OnboardingContext';

const OnboardingLayout = () => {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: styles.stackContent,
        }}
      >
        <Stack.Screen name="cv-upload" /> {/* Profile Card Intro - Screen 3 */}
        <Stack.Screen name="name-input" /> {/* Name Input - Screen 4 */}
        <Stack.Screen name="age-input" /> {/* Age Input - Screen 5 */}
        <Stack.Screen name="job-role" /> {/* Industry Selection - Screen 6 */}
        <Stack.Screen name="industry-struggle" /> {/* Industry Struggle - Screen 7 */}
        <Stack.Screen name="past-outcomes" /> {/* Past Interview Outcomes - Screen 8 */}
        <Stack.Screen name="vulnerability-failed" /> {/* Vulnerability Failed - Screen 9a */}
        <Stack.Screen name="vulnerability-confident" /> {/* Vulnerability Confident - Screen 9b */}
        <Stack.Screen name="preparation-level" /> {/* Preparation Level - Screen 10a */}
        <Stack.Screen name="strongest-skill" /> {/* Weakest Skill - Screen 10b */}
        <Stack.Screen name="frustrations" /> {/* Frustrations - Screen 11a */}
        <Stack.Screen name="success-vision" /> {/* Success Vision - Screen 11b */}
        <Stack.Screen name="worst-case-scenario" /> {/* Worst Case Scenario - Screen 11c */}
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
    backgroundColor: 'transparent',
  },
});

export default OnboardingLayout;