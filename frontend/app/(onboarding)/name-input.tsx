import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../context/authentication/AuthContext';
import { useUpdateProfile } from '../../_queries/users/auth/users';
import { useToast } from '../../components/Toast';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';

const NameInput = () => {
  const { data, updateData } = useOnboarding();
  const { auth } = useAuth();
  const { showToast } = useToast();
  const { navigateWithTransition } = useOnboardingNavigation();
  
  const [name, setName] = useState(auth?.name || '');

  // Log when the screen focuses to ensure we see logs upon arrival
  useFocusEffect(
    React.useCallback(() => {
      console.log('NameInput focused. name state =', name, 'auth?.name =', auth?.name);
    }, [name, auth?.name])
  );
  
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Keep local state and onboarding context in sync with auth once it loads/changes
  useEffect(() => {
    const authName = auth?.name || '';
    setName(authName);
    updateData('name', authName);
  }, [auth?.name]);

  const handleContinue = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      updateData('name', trimmedName);
      
      // Only make API call if name has changed from the auth name
      if (trimmedName !== (auth?.name || '')) {
        updateProfile({ name: trimmedName }, {
          onSuccess: () => {
            navigateWithTransition('/(onboarding)/age-input');
          },
          onError: (error: any) => {
            const errorMessage = error.response?.data?.detail || 'Failed to update name';
            showToast(errorMessage, 'error');
          }
        });
      } else {
        navigateWithTransition('/(onboarding)/age-input');
      }
    }
  };

  return (
    <OnboardingLayout currentStep={4} totalSteps={12}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={48} color={Colors.brand.primary} />
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
            style={[styles.continueButton, (!name.trim() || isUpdating) && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!name.trim() || isUpdating}
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
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
  },
  textInput: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
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

export default NameInput;