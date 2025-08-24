import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
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
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.assessmentOverlay}>
        <View style={styles.container}>
          <OnboardingProgress currentStep={8} totalSteps={17} />
          
          <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle-outline" size={64} color="#A855F7" />
          </View>
          
          <Text style={styles.screenTitle}>Have you interviewed before?</Text>
          <Text style={styles.questionText}>
            Have you ever failed to progress in a hiring process before?
          </Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                hasFailed === true && styles.optionButtonSelected
              ]}
              onPress={() => setHasFailed(true)}
            >
              <View style={styles.optionContent}>
                <Ionicons name="close-circle" size={24} color={hasFailed === true ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)'} />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    hasFailed === true && styles.optionTitleSelected
                  ]}>
                    Yes
                  </Text>
                  <Text style={styles.optionSubtext}>
                    I've been rejected before
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                hasFailed === false && styles.optionButtonSelected
              ]}
              onPress={() => setHasFailed(false)}
            >
              <View style={styles.optionContent}>
                <Ionicons name="checkmark-circle" size={24} color={hasFailed === false ? '#F59E0B' : 'rgba(255, 255, 255, 0.7)'} />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    hasFailed === false && styles.optionTitleSelected
                  ]}>
                    No
                  </Text>
                  <Text style={styles.optionSubtext}>
                    I haven't interviewed much yet
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
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
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  assessmentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 460,
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 28,
    padding: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 20,
    alignSelf: 'center',
    width: 96,
    height: 96,
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 26,
    fontWeight: '500',
  },
  optionContainer: {
    gap: 14,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.8)',
    transform: [{ scale: 1.02 }],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#F59E0B',
  },
  optionSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(245, 158, 11, 0.5)',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PastOutcomes;