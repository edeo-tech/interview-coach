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
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';
import useHapticsSafely from '../../hooks/haptics/useHapticsSafely';
import { ImpactFeedbackStyle } from 'expo-haptics';

const SectionTransition = () => {
  const { impactAsync } = useHapticsSafely();
  
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
    impactAsync(ImpactFeedbackStyle.Light);
    router.push('/(onboarding)/job-role');
  };

  const handleBack = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={6} 
          totalSteps={12}
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
              <Ionicons name="analytics-outline" size={64} color={Colors.text.secondary} />
            </View>
            
            {/* Main transition message */}
            <View style={styles.titleContainer}>
              <Text style={styles.mainMessage}>
                Now let's understand
              </Text>
              <Text style={styles.highlightMessage}>
                how you interview
              </Text>
            </View>
            
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
            <Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ChatGPTBackground>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.transparent,
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainMessage: {
    ...TYPOGRAPHY.displaySmall,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  highlightMessage: {
    ...TYPOGRAPHY.heroMedium,
    color: Colors.brand.primary,
    textAlign: 'center',
  },
  supportingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  
  // Button section
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',  // Center the button
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,                                      // Design system constraint
    height: 56,
    borderRadius: 28,                                    // Design system pill shape
    backgroundColor: Colors.glass.purple,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
    marginRight: 8,
  },
});

export default SectionTransition;