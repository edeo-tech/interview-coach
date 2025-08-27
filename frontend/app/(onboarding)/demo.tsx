import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions } from 'react-native';
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

const SolutionFraming = () => {
  const { data } = useOnboarding();

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
        router.push('/(onboarding)/notifications');
      }, 100);
    });
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

  const getSteps = () => {
    return [
      {
        title: 'Structured Practice',
        description: 'AI-powered mock interviews tailored to your industry'
      },
      {
        title: 'Real-time Feedback', 
        description: 'Get instant insights on your communication and content'
      },
      {
        title: 'Build Confidence',
        description: 'Practice until you feel ready for any question'
      },
      {
        title: 'Land the Job',
        description: 'Interview with confidence and get the offer'
      }
    ];
  };

  const getPersonalizedMessage = () => {
    const industryName = data.industry ? data.industry.charAt(0).toUpperCase() + data.industry.slice(1) : 'your industry';
    
    if (data.hasFailed) {
      return `Structured practice helps ${industryName} candidates turn past struggles into interview success.`;
    } else {
      return `Most ${industryName} candidates see dramatic confidence improvements with structured practice.`;
    }
  };

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={15} 
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
          <ScrollView 
            style={styles.scrollContent} 
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={styles.screenTitle}>Here's how we'll help</Text>
              
              <Text style={styles.subtitle}>
                Your personalized path to interview success:
              </Text>
              
              <View style={styles.stepsContainer}>
                {getSteps().map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.messageContainer}>
                <Text style={styles.personalizedMessage}>
                  {getPersonalizedMessage()}
                </Text>
              </View>
            </View>
          </ScrollView>
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
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>I'm ready to start</Text>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Space for button
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingVertical: 32,
  },
  screenTitle: {
    ...TYPOGRAPHY.sectionHeader,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 24,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.purple,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  stepNumberText: {
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
    color: Colors.brand.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 4,
  },
  stepDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.tertiary,
    lineHeight: 18,
  },
  messageContainer: {
    backgroundColor: Colors.glass.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glass.backgroundSubtle,
    width: '100%',
    maxWidth: 320,
  },
  personalizedMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
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
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.text.primary,
    marginRight: 8,
  },
});

export default SolutionFraming;