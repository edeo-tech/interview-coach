import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import CVProfileDisplay from '../../components/CVProfileDisplay';
import { useCV } from '../../_queries/interviews/cv';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import { GlassStyles, GlassTextColors } from '../../constants/GlassStyles';
import ChatGPTBackground from '../../components/ChatGPTBackground';

export default function CVProfile() {
  const { data: cv, isLoading } = useCV();
  const { posthogScreen } = usePosthogSafely();

  React.useEffect(() => {
    posthogScreen('cv_profile_display');
  }, [posthogScreen]);

  // If no CV data, redirect back to CV upload
  React.useEffect(() => {
    if (!isLoading && !cv) {
      router.replace('/interviews/cv-upload');
    }
  }, [cv, isLoading]);

  if (isLoading) {
    return (
      <ChatGPTBackground style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingTitle}>Loading CV Profile...</Text>
          </View>
        </View>
      </ChatGPTBackground>
    );
  }

  if (!cv) {
    return null; // Will redirect
  }

  return <CVProfileDisplay profile={cv} />;
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    ...GlassStyles.card,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    marginHorizontal: 20,
  },
  loadingTitle: {
    color: GlassTextColors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});