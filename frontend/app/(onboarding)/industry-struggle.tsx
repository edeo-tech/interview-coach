import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const IndustryStruggle = () => {
  const { data, updateData } = useOnboarding();
  const [strugglesApply, setStrugglesApply] = useState<boolean | null>(null);

  const getIndustryStruggles = (industry: string) => {
    const struggles = {
      technology: ['Technical communication', 'System design questions', 'Coding under pressure'],
      marketing: ['ROI measurement', 'Campaign strategy', 'Creative presentation'],
      sales: ['Objection handling', 'Pipeline management', 'Closing techniques'],
      finance: ['Financial modeling', 'Risk assessment', 'Regulatory knowledge'],
      healthcare: ['Patient care scenarios', 'Ethical decisions', 'Clinical knowledge'],
      education: ['Classroom management', 'Curriculum design', 'Student assessment'],
      consulting: ['Case study analysis', 'Client presentation', 'Problem structuring'],
      other: ['Industry knowledge', 'Technical skills', 'Communication'],
    };
    return struggles[industry] || struggles.other;
  };

  const handleContinue = () => {
    if (strugglesApply !== null) {
      // We don't need to store this anymore, just continue to next screen
      router.push('/(onboarding)/past-outcomes');
    }
  };

  const industryName = data.industry.charAt(0).toUpperCase() + data.industry.slice(1);
  const struggles = getIndustryStruggles(data.industry);

  return (
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={7} totalSteps={17} />
        
        <View style={styles.content}>
          <Text style={styles.screenTitle}>Does this sound familiar?</Text>
          <Text style={styles.subtitle}>
            Most people in {industryName} struggle with:
          </Text>
          
          <View style={styles.strugglesContainer}>
            {struggles.map((struggle, index) => (
              <View key={index} style={styles.struggleItem}>
                <Ionicons name="alert-circle-outline" size={20} color="#F59E0B" />
                <Text style={styles.struggleText}>{struggle}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.questionText}>
            Do you feel these apply to you?
          </Text>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                strugglesApply === true && styles.optionButtonSelected
              ]}
              onPress={() => setStrugglesApply(true)}
            >
              <Text style={[
                styles.optionText,
                strugglesApply === true && styles.optionTextSelected
              ]}>
                Yes, these resonate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                strugglesApply === false && styles.optionButtonSelected
              ]}
              onPress={() => setStrugglesApply(false)}
            >
              <Text style={[
                styles.optionText,
                strugglesApply === false && styles.optionTextSelected
              ]}>
                No, I'm confident here
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, strugglesApply === null && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={strugglesApply === null}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
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
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  strugglesContainer: {
    gap: 12,
    marginBottom: 32,
  },
  struggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  struggleText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    flex: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  optionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#F59E0B',
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

export default IndustryStruggle;