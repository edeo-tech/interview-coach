import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as StoreReview from 'expo-store-review';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import usePosthogSafely from '../../hooks/posthog/usePosthogSafely';
import { TYPOGRAPHY } from '../../constants/Typography';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingReviews = () => {
  const { posthogCapture } = usePosthogSafely();
  const [selectedIndustry] = useState('Marketing'); // This would come from onboarding context

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

  useEffect(() => {
    requestStoreReview();
  }, []);

  const requestStoreReview = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      const hasAction = await StoreReview.hasAction();
      
      if (isAvailable && hasAction) {
        // Add a small delay to ensure the screen is fully loaded
        setTimeout(async () => {
          try {
            await StoreReview.requestReview();
            posthogCapture('onboarding_review_requested', {
              platform: Platform.OS
            });
          } catch (reviewError) {
            // Silently fail - this is expected in simulator/development
            console.log('Store review not available in current environment');
          }
        }, 1000);
      }
    } catch (error) {
      // Silently handle - store review failures shouldn't impact UX
      console.log('Store review not available:', error.message);
    }
  };

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Marketing Manager',
      industry: 'Marketing',
      text: 'I froze in 3 real interviews. After 6 mocks, I landed an offer at a top tech company.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Software Engineer',
      industry: 'Technology',
      text: 'The AI feedback was spot-on. Helped me identify blind spots I never knew I had.',
      rating: 5
    },
    {
      name: 'Jennifer L.',
      role: 'Sales Director',
      industry: 'Sales',
      text: 'Went from nervous wreck to confident closer. 9x improvement is no joke!',
      rating: 5
    }
  ];

  const industryMatchedTestimonials = testimonials.filter(t => 
    t.industry === selectedIndustry || t.industry === 'General'
  ).concat(testimonials.filter(t => t.industry !== selectedIndustry)).slice(0, 2);

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
        router.push({ 
          pathname: '/(app)/paywall',
          params: { source: 'onboarding' }
        });
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

  return (
    <ChatGPTBackground style={styles.gradient}>
      <View style={styles.container}>
        <OnboardingProgress 
          currentStep={17} 
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
            <Text style={styles.screenTitle}>Join thousands who got hired</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10,000+</Text>
                <Text style={styles.statLabel}>Success Stories</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>87%</Text>
                <Text style={styles.statLabel}>Get Offers</Text>
              </View>
            </View>

            <Text style={styles.subtitle}>
              Real results from people just like you
            </Text>

            <View style={styles.testimonialsContainer}>
              {industryMatchedTestimonials.map((testimonial, index) => (
                <View key={index} style={styles.testimonialCard}>
                  <View style={styles.quoteIcon}>
                    <Ionicons name="quote" size={20} color={Colors.brand.primary} />
                  </View>
                  <Text style={styles.testimonialText}>{testimonial.text}</Text>
                  <View style={styles.testimonialFooter}>
                    <View style={styles.authorInfo}>
                      <Text style={styles.testimonialAuthor}>{testimonial.name}</Text>
                      <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                    </View>
                    <View style={styles.industryBadge}>
                      <Text style={styles.industryText}>{testimonial.industry}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.trustIndicator}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.semantic.successAlt} />
              <Text style={styles.trustText}>Trusted by professionals worldwide</Text>
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
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Get Started</Text>
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
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  animatedContent: {
    flex: 1,
  },
  screenTitle: {
    ...TYPOGRAPHY.heading1,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.glass.backgroundSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.glass.borderSecondary,
    width: '100%',
    maxWidth: 320,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TYPOGRAPHY.displaySmall,
    fontWeight: '700',
    color: Colors.brand.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSmall,
    fontWeight: '500',
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.glass.borderInteractive,
    marginHorizontal: 20,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  testimonialsContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 320,
    marginBottom: 20,
  },
  testimonialCard: {
    backgroundColor: Colors.glass.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.6,
  },
  testimonialText: {
    ...TYPOGRAPHY.bodyMedium,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 16,
    paddingRight: 32,
  },
  testimonialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flex: 1,
  },
  testimonialAuthor: {
    ...TYPOGRAPHY.labelMedium,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  testimonialRole: {
    ...TYPOGRAPHY.bodyXSmall,
    color: Colors.text.muted,
  },
  industryBadge: {
    backgroundColor: Colors.glass.purple,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.glass.purpleMedium,
  },
  industryText: {
    ...TYPOGRAPHY.overline,
    color: Colors.brand.primary,
  },
  trustIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.glass.successSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.glass.successBorderAlt,
  },
  trustText: {
    ...TYPOGRAPHY.labelSmall,
    color: Colors.semantic.successAlt,
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
  continueButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: Colors.white,
    marginRight: 8,
  },
});

export default OnboardingReviews;