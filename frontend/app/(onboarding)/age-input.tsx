import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';

const AgeInput = () => {
  const { data, updateData } = useOnboarding();
  const [age, setAge] = useState(data.age);
  const { navigateWithTransition } = useOnboardingNavigation();

  const handleContinue = () => {
    if (age.trim() && !isNaN(Number(age)) && Number(age) > 0) {
      updateData('age', age.trim());
      navigateWithTransition('/(onboarding)/job-role');
    }
  };

  const isValidAge = age.trim() && !isNaN(Number(age)) && Number(age) >= 16 && Number(age) <= 100;

  return (
    <OnboardingLayout currentStep={5} totalSteps={17}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar-outline" size={48} color="#A855F7" />
          </View>
          
          <Text style={styles.screenTitle}>What's your age?</Text>
          <Text style={styles.subtitle}>
            Thanks, {data.name}. We'll tailor this to you.
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your age"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              autoFocus={true}
              maxLength={2}
            />
          </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !isValidAge && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!isValidAge}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardAvoidingView>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 150,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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

export default AgeInput;