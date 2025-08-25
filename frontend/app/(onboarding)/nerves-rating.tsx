import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const NervesRating = () => {
  const { data, updateData } = useOnboarding();
  const [selectedRating, setSelectedRating] = useState(data.nervesRating || 0);

  const handleContinue = () => {
    if (selectedRating > 0) {
      updateData('nervesRating', selectedRating);
      router.push('/(onboarding)/problems');
    }
  };

  const getFraming = () => {
    if (data.hasFailed) {
      return {
        title: 'Nervousness Issues',
        question: 'How much did nervousness contribute to your interview struggles?',
        description: 'Think about anxiety, confidence, composure under pressure, and managing stress.'
      };
    } else {
      return {
        title: 'Nervousness Concerns',
        question: 'How likely is nervousness to be problematic in your interviews?',
        description: 'Consider anxiety, confidence, composure under pressure, and managing stress.'
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
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.assessmentOverlay}>
        <View style={styles.container}>
        <OnboardingProgress currentStep={11} totalSteps={17} />
        
        <View style={styles.content}>
          <Text style={styles.screenTitle}>{framing.title}</Text>
          
          <View style={styles.problemContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="heart-outline" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.problemDescription}>
              {framing.description}
            </Text>
          </View>

          <Text style={styles.questionText}>
            {framing.question}
          </Text>

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
                <View style={styles.ratingHeader}>
                  <View style={[
                    styles.ratingNumber,
                    selectedRating === rating.value && styles.ratingNumberSelected
                  ]}>
                    <Text style={[
                      styles.ratingNumberText,
                      selectedRating === rating.value && styles.ratingNumberTextSelected
                    ]}>
                      {rating.value}
                    </Text>
                  </View>
                  <View style={styles.ratingTextContainer}>
                    <Text style={[
                      styles.ratingLabel,
                      selectedRating === rating.value && styles.ratingLabelSelected
                    ]}>
                      {rating.label}
                    </Text>
                    <Text style={styles.ratingSublabel}>
                      {rating.sublabel}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
      </View>
    </MorphingBackground>
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxWidth: 480,
    alignSelf: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  problemContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  problemDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  ratingContainer: {
    gap: 12,
  },
  ratingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratingButtonSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratingNumberSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  ratingNumberText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '700',
  },
  ratingNumberTextSelected: {
    color: '#ffffff',
  },
  ratingTextContainer: {
    flex: 1,
  },
  ratingLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  ratingLabelSelected: {
    color: '#F59E0B',
  },
  ratingSublabel: {
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

export default NervesRating;