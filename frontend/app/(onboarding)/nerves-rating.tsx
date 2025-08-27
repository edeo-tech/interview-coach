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
import { TYPOGRAPHY } from '../../constants/Typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NervesRating = () => {
  const { data, updateData } = useOnboarding();
  const [selectedRating, setSelectedRating] = useState(data.nervesRating || 0);

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

  const handleContinue = () => {
    if (selectedRating > 0) {
      updateData('nervesRating', selectedRating);
      
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
          router.push('/(onboarding)/problems');
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

  const getFraming = () => {
    if (data.hasFailed) {
      return {
        title: 'Nerves & Anxiety',
        question: 'How much did nerves & anxiety contribute to your interview struggles?',
        description: 'Think about stress levels, confidence, staying calm, and managing pressure.'
      };
    } else {
      return {
        title: 'Nerves & Anxiety',
        question: 'How likely are nerves & anxiety to be problematic in your interviews?',
        description: 'Consider stress levels, confidence, staying calm, and managing pressure.'
      };
    }
  };

  const framing = getFraming();
  
  const ratingLabels = [
    { value: 1, label: 'Not a problem', sublabel: 'Very confident' },
    { value: 2, label: 'Minor issue', sublabel: 'Mostly confident' },
    { value: 3, label: 'Moderate concern', sublabel: 'Somewhat confident' },
    { value: 4, label: 'Significant problem', sublabel: 'Not very confident' },
    { value: 5, label: 'Major issue', sublabel: 'Very concerned' },
  ];

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={12} 
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
            <Text style={styles.screenTitle}>{framing.question}</Text>

            <View style={styles.ratingContainer}>
              {ratingLabels.map((rating) => (
                <TouchableOpacity
                  key={rating.value}
                  style={[
                    styles.ratingButton,
                    selectedRating === rating.value && styles.ratingButtonSelected
                  ]}
                  onPress={() => setSelectedRating(rating.value)}
                >
                  <View style={[
                    styles.numberContainer,
                    selectedRating === rating.value && styles.numberContainerSelected
                  ]}>
                    <Text style={[
                      styles.ratingNumber,
                      selectedRating === rating.value && styles.ratingNumberSelected
                    ]}>
                      {rating.value}
                    </Text>
                  </View>
                  <Text style={[
                    styles.ratingLabel,
                    selectedRating === rating.value && styles.ratingLabelSelected
                  ]}>
                    {rating.label}
                  </Text>
                </TouchableOpacity>
              ))}
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
            style={[styles.continueButton, selectedRating === 0 && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={selectedRating === 0}
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
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 48,
  },
  ratingContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  ratingButton: {
    backgroundColor: Colors.glass.backgroundSecondary,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.glass.backgroundSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ratingButtonSelected: {
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
  ratingNumber: {
    ...TYPOGRAPHY.labelMedium,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  ratingNumberSelected: {
    color: Colors.brand.primary,
  },
  ratingLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.primary,
    lineHeight: 20,
    flex: 1,
  },
  ratingLabelSelected: {
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
  continueButtonDisabled: {
    backgroundColor: Colors.glass.purpleSubtle,
    borderColor: Colors.glass.purpleLight,
    shadowOpacity: 0,
  },
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
    marginRight: 8,
  },
});

export default NervesRating;