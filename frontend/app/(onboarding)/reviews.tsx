import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

const OnboardingReviews = () => {
  const { posthogCapture } = usePosthogSafely();

  useEffect(() => {
    requestStoreReview();
  }, []);

  const requestStoreReview = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        posthogCapture('onboarding_review_requested', {
          platform: Platform.OS
        });
      }
    } catch (error) {
      console.error('Error requesting store review:', error);
      posthogCapture('onboarding_review_error', {
        error: error.message,
        platform: Platform.OS
      });
    }
  };

  const handleContinue = () => {
    router.push({ 
      pathname: '/(app)/paywall',
      params: { source: 'onboarding' }
    });
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={8} totalSteps={8} />
        
        <View style={styles.content}>
          <Text style={styles.screenTitle}>User Reviews</Text>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingReviews;