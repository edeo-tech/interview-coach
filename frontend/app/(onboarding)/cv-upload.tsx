import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';

const ProfileCardIntro = () => {
  const { navigateWithTransition } = useOnboardingNavigation();

  const handleContinue = () => {
    navigateWithTransition('/(onboarding)/name-input');
  };

  return (
    <OnboardingLayout currentStep={3} totalSteps={12}>
      <View style={styles.content}>
        {/* Simple icon - following welcome screen approach */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/images/FinalAppIconTransparent.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Typography following design system hierarchy */}
        <Text style={styles.titleMain}>Let's build your</Text>
        <Text style={styles.titleBrand}>profile</Text>
        
        <Text style={styles.subtitle}>
          We'll create a personalized interview prep plan tailored just for you.
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Let's start building</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24, // Design system screenPadding
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  
  // Icon section - simplified like welcome screen
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16, // Reduced spacing for better flow
  },
  iconImage: {
    width: 80,  // Smaller than welcome screen for hierarchy
    height: 80,
  },
  
  // Typography - following new design system
  titleMain: {
    // Design system title style (like "Get to the")
    ...TYPOGRAPHY.displaySmall,
    fontWeight: '300',
    color: Colors.white,
    textAlign: 'center',
  },
  titleBrand: {
    // Design system hero style (like "nextround")
    ...TYPOGRAPHY.heroMedium,
    color: Colors.brand.primary,
    textAlign: 'center',
    marginBottom: 60, // Design system xxl spacing
  },
  subtitle: {
    // Design system supporting text
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 320, // Design system maxContentWidth
    paddingHorizontal: 32,
  },
  
  // Button section - exact welcome screen style  
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30, // Better spacing from bottom
  },
  primaryButton: {
    // Exact style from welcome screen
    width: '100%',
    height: 56,
    borderRadius: 28, // Perfect pill shape
    backgroundColor: Colors.glass.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.brand.primaryRGB,
  },
  primaryButtonText: {
    // Design system button typography
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
    marginRight: 8,
  },
});

export default ProfileCardIntro;