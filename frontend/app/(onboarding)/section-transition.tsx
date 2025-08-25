import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  Animated
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';

const SectionTransition = () => {
  // Animation for content entrance
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      // Reset animation values
      contentOpacity.setValue(0);
      contentTranslateY.setValue(30);
      buttonOpacity.setValue(0);

      // Animate content in after a short delay (let background morph first)
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();

        // Animate button in after content
        setTimeout(() => {
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        }, 400);
      }, 600); // Wait for background morphing to start

      return () => clearTimeout(timer);
    }, [])
  );

  const handleContinue = () => {
    router.push('/(onboarding)/job-role');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <MorphingBackground mode="expanded" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={6} 
          totalSteps={17}
          onBack={handleBack}
        />
        
        <View style={styles.content}>
          {/* Animated main content */}
          <Animated.View 
            style={[
              styles.messageContainer,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              }
            ]}
          >
            {/* Subtle icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="analytics-outline" size={64} color="rgba(255, 255, 255, 0.9)" />
            </View>
            
            {/* Main transition message */}
            <Text style={styles.mainMessage}>
              Now let's understand
            </Text>
            <Text style={styles.highlightMessage}>
              how you interview
            </Text>
            
            {/* Supporting text */}
            <Text style={styles.supportingText}>
              We'll explore your interview experience to create the perfect preparation plan
            </Text>
          </Animated.View>
        </View>

        {/* Animated continue button */}
        <Animated.View 
          style={[
            styles.bottomContainer,
            { opacity: buttonOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
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
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  // Message content
  messageContainer: {
    alignItems: 'center',
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.8,
  },
  mainMessage: {
    fontSize: 32,
    fontWeight: '300',
    fontFamily: 'SpaceGrotesk',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
  },
  highlightMessage: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 32,
    textShadowColor: 'rgba(168, 85, 247, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  supportingText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  
  // Button section
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 16, // Slightly more rounded for this screen
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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

export default SectionTransition;