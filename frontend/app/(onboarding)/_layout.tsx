import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatGPTBackground from '../../components/ChatGPTBackground';

const OnboardingLayout = () => {
  return (
    <ChatGPTBackground style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
      </SafeAreaView>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stackContent: {
    backgroundColor: 'transparent',
  },
});

export default OnboardingLayout;