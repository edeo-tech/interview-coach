import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IndustryStruggle = () => {
  const { data, updateData } = useOnboarding();
  const [strugglesApply, setStrugglesApply] = useState<boolean | null>(null);

  // Animation values - exactly like profile-setup
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // Entrance animation - exactly like profile-setup with direction awareness
  useFocusEffect(
    React.useCallback(() => {
      // Determine slide direction based on last navigation direction
      const slideInFrom = getNavigationDirection() === 'back' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      // Reset to slide-in position 
      contentTranslateX.setValue(slideInFrom);
      buttonTranslateY.setValue(30);
      contentOpacity.setValue(0);
      buttonOpacity.setValue(0);
      
      // Add a brief pause before sliding in new content for a more relaxed feel - exactly like profile-setup
      setTimeout(() => {
        // Animate in content and button together with gentle timing - exactly like profile-setup
        Animated.parallel([
          Animated.timing(contentTranslateX, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          // Button animates in slightly after content starts, creating a nice cascade - exactly like profile-setup
          Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
              Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(buttonTranslateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              })
            ])
          ])
        ]).start();
      }, 100);
    }, [])
  );

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
      // Set direction for next screen
      setNavigationDirection('forward');
      
      // Slide out to left (forward direction) - exactly like profile-setup
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
        })
      ]).start(() => {
        // Navigate after animation completes
        setTimeout(() => {
          router.push('/(onboarding)/past-outcomes');
        }, 100);
      });
    }
  };

  const handleBack = () => {
    // Set direction for previous screen
    setNavigationDirection('back');
    
    // Slide out to right (back direction) - exactly like profile-setup
    Animated.parallel([
      Animated.timing(contentTranslateX, {
        toValue: SCREEN_WIDTH,
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
      })
    ]).start(() => {
      setTimeout(() => {
        router.back();
      }, 100);
    });
  };

  const industryName = data.industry.charAt(0).toUpperCase() + data.industry.slice(1);
  const struggles = getIndustryStruggles(data.industry);

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={8} 
          totalSteps={17}
          onBack={handleBack}
        />
        
        {/* Animated content container - exactly like profile-setup */}
        <Animated.View 
          style={[
            styles.animatedContent,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            }
          ]}
        >
          <View style={styles.content}>
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
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.bottomContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.continueButton, strugglesApply === null && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={strugglesApply === null}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
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
  animatedContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 100, // Space for button
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: Colors.text.tertiary,
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
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  optionButton: {
    backgroundColor: Colors.glass.backgroundSecondary,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  optionButtonSelected: {
    backgroundColor: Colors.glass.purple,
    borderColor: Colors.brand.primary,
  },
  numberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberContainerSelected: {
    backgroundColor: Colors.glass.purpleTint,
  },
  optionNumber: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  optionNumberSelected: {
    color: Colors.brand.primary,
  },
  optionText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 20,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.brand.primary,
    fontWeight: '600',
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glass.purple,
    borderWidth: 1,
    borderColor: Colors.brand.primaryRGB,
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
  continueButtonDisabled: {
    backgroundColor: Colors.glass.purpleSubtle,
    borderColor: Colors.glass.purpleLight,
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.005,
    color: Colors.white,
    marginRight: 8,
  },
});

export default IndustryStruggle;