import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';

const CommunicationRating = () => {
  const { data, updateData } = useOnboarding();
  const [selectedRating, setSelectedRating] = useState(data.communicationRating || 0);
  const { navigateWithTransition } = useOnboardingNavigation();

  const handleContinue = () => {
    if (selectedRating > 0) {
      updateData('communicationRating', selectedRating);
      navigateWithTransition('/(onboarding)/nerves-rating');
    }
  };

  const getFraming = () => {
    if (data.hasFailed) {
      return {
        title: 'Communication Issues',
        question: 'How much did communication & professionalism contribute to your interview struggles?',
        description: 'Think about clear explanations, professional tone, body language, and active listening.'
      };
    } else {
      return {
        title: 'Communication Concerns',
        question: 'How likely are communication & professionalism issues to be problematic in your interviews?',
        description: 'Consider clear explanations, professional tone, body language, and active listening.'
      };
    }
  };

  const framing = getFraming();
  
  const ratingLabels = [
    { value: 1, label: 'Not a problem', sublabel: 'Very confident' },
    { value: 2, label: 'Minor issue', sublabel: 'Mostly confident' },
    { value: 3, label: 'Moderate concern', sublabel: 'Somewhat confident' },
    { value: 4, label: 'Significant problem', sublabel: 'Not very confident' },
    { value: 5, label: 'Major issue', sublabel: 'Very concerned' },
  ];

  return (
    <OnboardingLayout currentStep={11} totalSteps={17}>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>{framing.question}</Text>

        <View style={styles.ratingContainer}>
          {ratingLabels.map((rating) => (
            <TouchableOpacity
              key={rating.value}
              style={[
                styles.ratingButton,
                selectedRating === rating.value && styles.ratingButtonSelected
              ]}
              onPress={() => setSelectedRating(rating.value)}
            >
              <View style={[
                styles.numberContainer,
                selectedRating === rating.value && styles.numberContainerSelected
              ]}>
                <Text style={[
                  styles.ratingNumber,
                  selectedRating === rating.value && styles.ratingNumberSelected
                ]}>
                  {rating.value}
                </Text>
              </View>
              <Text style={[
                styles.ratingLabel,
                selectedRating === rating.value && styles.ratingLabelSelected
              ]}>
                {rating.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, selectedRating === 0 && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={selectedRating === 0}
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
    textAlign: 'left',
    lineHeight: 30,
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  ratingContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
    marginBottom: 40,
  },
  ratingButton: {
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
  ratingButtonSelected: {
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
  ratingNumber: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  ratingNumberSelected: {
    color: '#A855F7',
  },
  ratingLabel: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 20,
    flex: 1,
  },
  ratingLabelSelected: {
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

export default CommunicationRating;