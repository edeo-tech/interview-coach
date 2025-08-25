import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IndustryStruggle = () => {
  const { data, updateData } = useOnboarding();
  const [strugglesApply, setStrugglesApply] = useState<boolean | null>(null);

  // Animation values - only for exit animations
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

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
      // Animate out before navigation
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: -SCREEN_WIDTH,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 30,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate after animation completes
        setTimeout(() => {
          router.push('/(onboarding)/past-outcomes');
        }, 100);
      });
    }
  };

  const industryName = data.industry.charAt(0).toUpperCase() + data.industry.slice(1);
  const struggles = getIndustryStruggles(data.industry);

  // Smart entrance animation - starts immediately on mount, no conflicts
  React.useEffect(() => {
    // Start content off-screen (right) and animate in quickly
    contentTranslateX.setValue(SCREEN_WIDTH);
    contentOpacity.setValue(0);
    buttonOpacity.setValue(0);
    buttonTranslateY.setValue(20);

    // Immediate entrance animation - no delay, no conflicts
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 450, // Faster than exit animation
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animates in with slight delay for cascade effect
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(buttonTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 150);
    }, 50); // Very brief delay to let background settle

    return () => clearTimeout(timer);
  }, []);

  return (
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={8} totalSteps={17} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={styles.screenTitle}>Does this sound familiar?</Text>
          
          <Text style={styles.subtitle}>
            Most {industryName} candidates struggle with:
          </Text>
          
          <View style={styles.strugglesContainer}>
            {struggles.map((struggle, index) => (
              <Text key={index} style={styles.struggleItem}>
                • {struggle}
              </Text>
            ))}
          </View>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                strugglesApply === true && styles.optionButtonSelected
              ]}
              onPress={() => setStrugglesApply(true)}
            >
              <View style={[
                styles.numberContainer,
                strugglesApply === true && styles.numberContainerSelected
              ]}>
                <Text style={[
                  styles.optionNumber,
                  strugglesApply === true && styles.optionNumberSelected
                ]}>
                  1
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                strugglesApply === true && styles.optionTextSelected
              ]}>
                Yes, I need help
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                strugglesApply === false && styles.optionButtonSelected
              ]}
              onPress={() => setStrugglesApply(false)}
            >
              <View style={[
                styles.numberContainer,
                strugglesApply === false && styles.numberContainerSelected
              ]}>
                <Text style={[
                  styles.optionNumber,
                  strugglesApply === false && styles.optionNumberSelected
                ]}>
                  2
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                strugglesApply === false && styles.optionTextSelected
              ]}>
                No, I'm confident
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.continueButtonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <TouchableOpacity 
          style={[styles.continueButton, strugglesApply === null && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={strugglesApply === null}
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
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Space for floating button
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: 'rgba(255, 255, 255, 0.70)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  strugglesContainer: {
    gap: 8,
    marginBottom: 48,
    alignItems: 'center',
  },
  struggleItem: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#A855F7',
  },
  numberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberContainerSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
  },
  optionNumber: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  optionNumberSelected: {
    color: '#A855F7',
  },
  optionText: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 20,
    flex: 1,
  },
  optionTextSelected: {
    color: '#A855F7',
    fontWeight: '600',
  },
  continueButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 24,
    right: 24,
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgb(169, 85, 247)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderColor: 'rgba(169, 85, 247, 0.3)',
    shadowOpacity: 0,
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

export default IndustryStruggle;