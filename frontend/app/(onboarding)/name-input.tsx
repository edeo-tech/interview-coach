import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TYPOGRAPHY } from '../../constants/Typography';

const NameInput = () => {
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name);
  const { navigateWithTransition } = useOnboardingNavigation();

  const handleContinue = () => {
    if (name.trim()) {
      updateData('name', name.trim());
      navigateWithTransition('/(onboarding)/age-input');
    }
  };

  return (
    <OnboardingLayout currentStep={4} totalSteps={17}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={48} color="#A855F7" />
          </View>
          
          <Text style={styles.screenTitle}>What's your name?</Text>
          <Text style={styles.subtitle}>
            We'll use this to personalize your experience
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your first name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus={true}
            />
          </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={[styles.continueButton, !name.trim() && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!name.trim()}
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
    ...TYPOGRAPHY.displaySmall,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
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
    ...TYPOGRAPHY.buttonLarge,
    color: '#ffffff',
  },
});

export default NameInput;