import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PastOutcomes = () => {
  const { data, updateData } = useOnboarding();
  const [hasFailed, setHasFailed] = useState<boolean | null>(data.hasFailed);
  const { navigateWithTransition } = useOnboardingNavigation();

  const handleContinue = () => {
    if (hasFailed !== null) {
      updateData('hasFailed', hasFailed);
      navigateWithTransition('/(onboarding)/preparation-rating');
    }
  };

  return (
    <OnboardingLayout currentStep={9} totalSteps={17}>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>How have your past interviews gone?</Text>
        <Text style={styles.subtitle}>
          Your experience helps us build a more effective preparation plan
        </Text>

        <View style={styles.optionContainer}>
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
                1
              </Text>
            </View>
            <Text style={[
              styles.optionText,
              hasFailed === false && styles.optionTextSelected
            ]}>
              Generally successful - looking to improve further
            </Text>
          </TouchableOpacity>

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
                2
              </Text>
            </View>
            <Text style={[
              styles.optionText,
              hasFailed === true && styles.optionTextSelected
            ]}>
              Struggled or failed - need to turn it around
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, hasFailed === null && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={hasFailed === null}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
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
    marginBottom: 40,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    flexShrink: 0,
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
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
  },
  continueButton: {
    width: '100%',
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