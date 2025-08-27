import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import { useSubmitReferralCode } from '../../_queries/users/referrals';
import { useToast } from '../../components/Toast';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReferralCodeInput = () => {
  // Animation values - exactly like other onboarding screens
  const contentTranslateX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // State
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitReferralMutation = useSubmitReferralCode();
  const { showToast } = useToast();

  // Entrance animation - exactly like other onboarding screens
  useFocusEffect(
    React.useCallback(() => {
      // Determine slide direction based on last navigation direction
      const slideInFrom = getNavigationDirection() === 'back' ? -SCREEN_WIDTH : SCREEN_WIDTH;
      
      // Reset to slide-in position 
      contentTranslateX.setValue(slideInFrom);
      buttonTranslateY.setValue(30);
      contentOpacity.setValue(0);
      buttonOpacity.setValue(0);
      
      // Add a brief pause before sliding in new content for a more relaxed feel
      setTimeout(() => {
        // Animate in content and button together with gentle timing
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
          // Button animates in slightly after content starts, creating a nice cascade
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

  const handleSubmitReferral = async () => {
    if (!referralCode.trim()) {
      handleSkip();
      return;
    }

    // Validate format (4 characters, letters and numbers only)
    const normalizedCode = referralCode.toUpperCase().trim();
    if (normalizedCode.length !== 4 || !/^[A-Z0-9]{4}$/.test(normalizedCode)) {
      showToast('Referral codes must be exactly 4 characters using letters and numbers only.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🎯 Submitting referral code:', normalizedCode);
      const response = await submitReferralMutation.mutateAsync({
        referral_code: normalizedCode
      });
      
      console.log('✅ Referral submission response:', response);
      
      if (response.success) {
        showToast(response.message, 'success');
        // Wait a bit for toast to show, then continue
        setTimeout(() => {
          handleContinue();
        }, 1500);
      }
    } catch (error: any) {
      console.error('❌ Referral submission error:', error);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error data:', error?.response?.data);
      
      const errorMessage = error?.response?.data?.detail || 'Failed to process referral code. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    // Set direction for next screen
    setNavigationDirection('forward');
    
    // Slide out to left (forward direction)
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
        router.push('/(onboarding)/reviews');
      }, 100);
    });
  };

  const handleSkip = () => {
    handleContinue();
  };

  const handleBack = () => {
    // Set direction for previous screen
    setNavigationDirection('back');
    
    // Slide out to right (back direction)
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

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={17} 
          totalSteps={18}
          onBack={handleBack}
        />
        
        {/* Animated content container */}
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
              <Text style={styles.screenTitle}>Got a referral code?</Text>
              
              <Text style={styles.subtitle}>
                Enter a friend's referral code to give them a free interview!
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.codeInput}
                  value={referralCode}
                  onChangeText={setReferralCode}
                  placeholder="Enter code (e.g. A7B3)"
                  placeholderTextColor={Colors.text.tertiary}
                  maxLength={4}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  textAlign="center"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <Ionicons name="gift" size={20} color={Colors.brand.primary} />
                  <Text style={styles.benefitText}>Your friend gets a free interview</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="people" size={20} color={Colors.brand.primary} />
                  <Text style={styles.benefitText}>Help them practice and succeed</Text>
                </View>
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
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmitReferral}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : (referralCode.trim() ? 'Submit Code' : 'Skip')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkip}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
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
    paddingBottom: 100, // Space for buttons
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
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 32,
    width: '100%',
    maxWidth: 200,
  },
  codeInput: {
    backgroundColor: Colors.glass.backgroundInput,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk',
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    letterSpacing: 2,
  },
  benefitsContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: Colors.text.secondary,
    flex: 1,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
    gap: 12,
  },
  submitButton: {
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
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.005,
    color: Colors.white,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter',
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default ReferralCodeInput;