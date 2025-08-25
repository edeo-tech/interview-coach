import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PastOutcomes = () => {
  const { data, updateData } = useOnboarding();
  const [hasFailed, setHasFailed] = useState<boolean | null>(data.hasFailed);

  const handleContinue = () => {
    if (hasFailed !== null) {
      updateData('hasFailed', hasFailed);
      // Route to Screen 9 (preparation rating) regardless of answer
      // The hasFailed value will be used for dual framing in subsequent screens
      router.push('/(onboarding)/preparation-rating');
    }
  };

  return (
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={8} totalSteps={17} />
        
        <View style={styles.content}>
          <Text style={styles.screenTitle}>Have you interviewed before?</Text>
          
          <Text style={styles.subtitle}>
            Have you ever failed to progress in a hiring process?
          </Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                hasFailed === true && styles.optionButtonSelected
              ]}
              onPress={() => setHasFailed(true)}
            >
              <View style={[
                styles.numberContainer,
                hasFailed === true && styles.numberContainerSelected
              ]}>
                <Text style={[
                  styles.optionNumber,
                  hasFailed === true && styles.optionNumberSelected
                ]}>
                  1
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                hasFailed === true && styles.optionTextSelected
              ]}>
                Yes, I've been rejected
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                hasFailed === false && styles.optionButtonSelected
              ]}
              onPress={() => setHasFailed(false)}
            >
              <View style={[
                styles.numberContainer,
                hasFailed === false && styles.numberContainerSelected
              ]}>
                <Text style={[
                  styles.optionNumber,
                  hasFailed === false && styles.optionNumberSelected
                ]}>
                  2
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                hasFailed === false && styles.optionTextSelected
              ]}>
                No, I'm new to this
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, hasFailed === null && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={hasFailed === null}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </MorphingBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  optionContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#A855F7',
  },
  numberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberContainerSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
  },
  optionNumber: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  optionNumberSelected: {
    color: '#A855F7',
  },
  optionText: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 20,
    flex: 1,
  },
  optionTextSelected: {
    color: '#A855F7',
    fontWeight: '600',
  },
  continueButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 24,
    right: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgb(169, 85, 247)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderColor: 'rgba(169, 85, 247, 0.3)',
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.005,
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default PastOutcomes;