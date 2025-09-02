import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ChatGPTBackground from '../../components/ChatGPTBackground';
import OnboardingProgress from '../../components/OnboardingProgress';
import { getNavigationDirection, setNavigationDirection } from '../../utils/navigationDirection';
import Colors from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ReassuranceDataProof = () => {
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
        router.push('/(onboarding)/reviews');
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
          currentStep={16} 
          totalSteps={12}
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
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name="shield-checkmark" 
                    size={48} 
                    color={Colors.brand.primary} 
                  />
                </View>
                <Text style={styles.screenTitle}>You're in good hands</Text>
              </View>

              {/* Stats Card */}
              <View style={styles.statsCard}>
                <View style={styles.statHighlight}>
                  <Text style={styles.statNumber}>9x</Text>
                  <Text style={styles.statLabel}>More Likely</Text>
                </View>
                <Text style={styles.statDescription}>
                  Users who complete 8 mocks are 9x more likely to reach the next round
                </Text>
              </View>

              {/* Testimonial Card */}
              <View style={styles.testimonialCard}>
                <View style={styles.quoteIcon}>
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.brand.primary} />
                </View>
                <Text style={styles.testimonialText}>
                  I froze in 3 real interviews. After 6 mocks with nextround, I landed my dream offer.
                </Text>
                <View style={styles.testimonialAuthor}>
                  <View style={styles.authorAvatar}>
                    <Text style={styles.avatarText}>S</Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>Sarah M.</Text>
                    <Text style={styles.authorRole}>Marketing Manager</Text>
                  </View>
                </View>
              </View>

              {/* Benefits Section */}
              <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>What you'll get</Text>
                <View style={styles.benefitsList}>
                  <View style={styles.benefitRow}>
                    <View style={styles.benefitIcon}>
                      <Ionicons name="checkmark" size={16} color={Colors.brand.primary} />
                    </View>
                    <Text style={styles.benefitItem}>AI-powered mock interviews</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <View style={styles.benefitIcon}>
                      <Ionicons name="checkmark" size={16} color={Colors.brand.primary} />
                    </View>
                    <Text style={styles.benefitItem}>Personalized feedback on every answer</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <View style={styles.benefitIcon}>
                      <Ionicons name="checkmark" size={16} color={Colors.brand.primary} />
                    </View>
                    <Text style={styles.benefitItem}>Industry-specific question preparation</Text>
                  </View>
                  <View style={styles.benefitRow}>
                    <View style={styles.benefitIcon}>
                      <Ionicons name="checkmark" size={16} color={Colors.brand.primary} />
                    </View>
                    <Text style={styles.benefitItem}>Confidence building through practice</Text>
                  </View>
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
            style={styles.continueButton} 
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>I'm convinced!</Text>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Space for button
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingVertical: 32,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glass.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  
  // Stats Card
  statsCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  statHighlight: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Nunito-Bold',
    color: Colors.brand.primary,
    lineHeight: 52,
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDescription: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  
  // Testimonial Card
  testimonialCard: {
    backgroundColor: Colors.glass.background,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.6,
  },
  testimonialText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
    fontStyle: 'italic',
    marginBottom: 16,
    paddingRight: 32,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.glass.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.brand.primary,
  },
  authorName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  authorRole: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: Colors.text.secondary,
  },
  
  // Benefits Section
  benefitsSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.glass.purpleTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  benefitItem: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: Colors.text.primary,
    flex: 1,
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
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.005,
    color: Colors.white,
    marginRight: 8,
  },
});

export default ReassuranceDataProof;