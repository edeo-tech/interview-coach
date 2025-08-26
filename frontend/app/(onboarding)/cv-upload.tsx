import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingNavigation } from '../../hooks/useOnboardingNavigation';
import OnboardingLayout from '../../components/OnboardingLayout';
import { TYPOGRAPHY } from '../../constants/Typography';

const ProfileCardIntro = () => {
  const { navigateWithTransition } = useOnboardingNavigation();

  const handleContinue = () => {
    navigateWithTransition('/(onboarding)/name-input');
  };

  return (
    <OnboardingLayout currentStep={3} totalSteps={17}>
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
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
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
    fontSize: 28,
    ...TYPOGRAPHY.overline,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  titleBrand: {
    // Design system hero style (like "nextround")
    fontSize: 48,
    ...TYPOGRAPHY.hero,
    lineHeight: 60,
    color: '#A855F7', // Brand purple
    textAlign: 'center',
    marginBottom: 60, // Design system xxl spacing
  },
  subtitle: {
    // Design system supporting text
    fontSize: 16,
    ...TYPOGRAPHY.bodyMedium,
    color: 'rgba(255, 255, 255, 0.70)', // Design system text.tertiary
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
    backgroundColor: 'rgba(168, 85, 247, 0.15)', // Subtle purple fill
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgb(169, 85, 247)', // Purple border
  },
  primaryButtonText: {
    // Design system button typography
    fontSize: 18,
    lineHeight: 22,
    ...TYPOGRAPHY.buttonMedium,
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default ProfileCardIntro;