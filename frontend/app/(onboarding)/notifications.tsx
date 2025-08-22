import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import OnboardingProgress from '../../components/OnboardingProgress';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';

const OnboardingNotifications = () => {
  const { posthogCapture } = usePosthogSafely();

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      posthogCapture('onboarding_notification_permission_result', {
        status: finalStatus,
        platform: Platform.OS
      });
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      posthogCapture('onboarding_notification_permission_error', {
        error: error.message,
        platform: Platform.OS
      });
    }
  };

  const handleContinue = () => {
    router.push('/(onboarding)/reviews');
  };

  return (
    <View style={styles.container}>
      <OnboardingProgress currentStep={6} totalSteps={8} />
      
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Enable Notifications</Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default OnboardingNotifications;