import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import { useUpdatePushToken } from '@/_queries/users/auth/push-token';

const OnboardingNotifications = () => {
  const { posthogCapture } = usePosthogSafely();
  const updatePushToken = useUpdatePushToken();
  const [isLoading, setIsLoading] = useState(false);

  const registerForPushNotificationsAsync = async () => {
    let token;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        // Save the push token to the backend
        await updatePushToken.mutateAsync(token);
        
        posthogCapture('onboarding_notification_permission_result', {
          status: 'granted',
          platform: Platform.OS,
          token_saved: true
        });
      } else {
        posthogCapture('onboarding_notification_permission_result', {
          status: 'denied',
          platform: Platform.OS,
          token_saved: false
        });
      }
      
      // Navigate to reviews after everything is complete
      router.push('/(onboarding)/reviews');
    } catch (error) {
      console.error('Error setting up notifications:', error);
      posthogCapture('onboarding_notification_permission_error', {
        error: error.message,
        platform: Platform.OS
      });
      // Navigate even if there's an error
      router.push('/(onboarding)/reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotNow = () => {
    posthogCapture('onboarding_notification_skipped', {
      platform: Platform.OS
    });
    router.push('/(onboarding)/reviews');
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={6} totalSteps={8} />
        
        <View style={styles.content}>
          <Text style={styles.screenTitle}>Stay Updated</Text>
          <Text style={styles.screenSubtitle}>Would you like to receive notifications about your interview preparation?</Text>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.disabledButton]} 
            onPress={handleEnableNotifications}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.continueButtonText}>Enable Notifications</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleNotNow}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>Not Now</Text>
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
    marginBottom: 12,
  },
  screenSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
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
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default OnboardingNotifications;