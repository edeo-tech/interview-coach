import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MorphingBackground from '../../components/MorphingBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from '../../contexts/OnboardingContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PreparationRating = () => {
  const { data, updateData } = useOnboarding();
  const [selectedRating, setSelectedRating] = useState(data.preparationRating || 0);

  // Animation values - initialized in off-screen state to prevent double appearance
  const contentTranslateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(20)).current;

  // Smart entrance animation - content already starts off-screen
  React.useEffect(() => {
    // Brief delay then animate in (content already positioned off-screen)
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animates in with slight delay for cascade effect
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(buttonTranslateY, {
            toValue: 0,
            duration: 340,
            useNativeDriver: true,
          }),
        ]).start();
      }, 120);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (selectedRating > 0) {
      updateData('preparationRating', selectedRating);
      
      // Animate out before navigation
      Animated.parallel([
        Animated.timing(contentTranslateX, {
          toValue: -SCREEN_WIDTH,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 430,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 30,
          duration: 430,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Navigate after animation completes
        setTimeout(() => {
          router.push('/(onboarding)/communication-rating');
        }, 100);
      });
    }
  };

  const getFraming = () => {
    if (data.hasFailed) {
      return {
        title: 'Lack of Preparation',
        question: 'How much did lack of preparation contribute to your interview struggles?',
        description: 'Think about research, practice questions, company knowledge, and having examples ready.'
      };
    } else {
      return {
        title: 'Preparation Concerns',
        question: 'How likely is lack of preparation to be problematic in your interviews?',
        description: 'Consider research, practice questions, company knowledge, and having examples ready.'
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
    <MorphingBackground mode="static" style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress currentStep={9} totalSteps={17} />
        
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateX: contentTranslateX }],
              opacity: contentOpacity,
            },
          ]}
        >
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
          style={[styles.continueButton, selectedRating === 0 && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={selectedRating === 0}
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
    paddingBottom: 100,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 30,
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  ratingContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  ratingButton: {
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
  ratingButtonSelected: {
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
  ratingNumber: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  ratingNumberSelected: {
    color: '#A855F7',
  },
  ratingLabel: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 20,
    flex: 1,
  },
  ratingLabelSelected: {
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

export default PreparationRating;