import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useUpdateProfile } from '../../_queries/users/auth/users';
import { useToast } from '../../components/Toast';
import Colors from '../../constants/Colors';
import { TYPOGRAPHY } from '../../constants/Typography';

const AgeInput = () => {
  const { data, updateData } = useOnboarding();
  const { showToast } = useToast();
  const [age, setAge] = useState(data.age);
  const { navigateWithTransition } = useOnboardingNavigation();
  
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const handleContinue = () => {
    if (age.trim() && !isNaN(Number(age)) && Number(age) > 0) {
      const ageNumber = Number(age);
      updateData('age', age.trim());
      
      updateProfile({ age: ageNumber }, {
        onSuccess: () => {
          navigateWithTransition('/(onboarding)/job-role');
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.detail || 'Failed to save age';
          showToast(errorMessage, 'error');
        }
      });
    }
  };

  const isValidAge = age.trim() && !isNaN(Number(age)) && Number(age) >= 16 && Number(age) <= 100;

  return (
    <OnboardingLayout currentStep={5} totalSteps={17}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar-outline" size={48} color={Colors.brand.primary} />
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
            style={[styles.continueButton, (!isValidAge || isUpdating) && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!isValidAge || isUpdating}
          >
            <Text style={styles.continueButtonText}>
              {isUpdating ? 'Saving...' : 'Continue'}
            </Text>
            {!isUpdating && <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />}
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
    ...TYPOGRAPHY.displaySmall,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 150,
  },
  textInput: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 24,
    color: Colors.text.primary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: Colors.accent.gold,
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.black,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.glass.goldLight,
    shadowOpacity: 0,
  },
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
  },
});

export default AgeInput;