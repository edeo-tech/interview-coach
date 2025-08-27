import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';

const AnalyzingScreen = () => {
  const { data } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const analysisSteps = [
    { text: 'Identifying your interview blockers...', icon: 'search-outline' },
    { text: `Finding best strategies for ${data.industry || 'your industry'}...`, icon: 'bulb-outline' },
    { text: 'Building your personal prep roadmap...', icon: 'map-outline' },
  ];

  useEffect(() => {
    const animateStep = (stepIndex: number) => {
      setCurrentStep(stepIndex);
      
      // Fade in animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Animate through all steps
    const timeouts = [
      setTimeout(() => animateStep(0), 500),
      setTimeout(() => animateStep(1), 2500),
      setTimeout(() => animateStep(2), 4500),
      setTimeout(() => {
        // Navigate to next screen after analysis is complete
        router.push('/(onboarding)/solutions');
      }, 6500),
    ];

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <OnboardingLayout currentStep={13} totalSteps={17}>
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <Animated.View 
            style={[
              styles.stepContainer,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name={analysisSteps[currentStep]?.icon as any || 'analytics-outline'} 
                size={64} 
                color={Colors.brand.primary} 
              />
            </View>
            
            <Text style={styles.stepText}>
              {analysisSteps[currentStep]?.text || 'Analyzing...'}
            </Text>
            
            {/* Progress dots */}
            <View style={styles.progressDots}>
              {analysisSteps.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot,
                    index <= currentStep && styles.dotActive
                  ]}
                />
              ))}
            </View>
          </Animated.View>
        </View>
      </View>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.9,
  },
  stepText: {
    ...TYPOGRAPHY.heading1,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.glass.borderSecondary,
  },
  dotActive: {
    backgroundColor: Colors.brand.primary,
    transform: [{ scale: 1.2 }],
  },
});

export default AnalyzingScreen;