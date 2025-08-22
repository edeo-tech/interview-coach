import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import OnboardingProgress from '../../components/OnboardingProgress';

const OnboardingJobRole = () => {
  const handleContinue = () => {
    router.push('/(onboarding)/problems');
  };

  return (
    <View style={styles.container}>
      <OnboardingProgress currentStep={2} totalSteps={8} />
      
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Job Role</Text>
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

export default OnboardingJobRole;