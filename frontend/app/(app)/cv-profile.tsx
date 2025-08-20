import React from 'react';
import { View, StyleSheet } from 'react-native';
import CVProfileDisplay from '../../components/CVProfileDisplay';
import { useCV } from '../../_queries/interviews/cv';
import { ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import { GlassTextColors } from '../../constants/GlassStyles';

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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={GlassTextColors.accent} />
      </View>
    );
  }

  if (!cv) {
    return null; // Will redirect
  }

  return <CVProfileDisplay profile={cv} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0A1F',
  },
});